"use client"

import { useCallback, useEffect, useRef, useState } from "react"

// ── Public types ──────────────────────────────────────────────────────────────

export type AddressResult = {
  line1:    string
  city:     string
  postcode: string
  country:  string   // ISO 2-letter code e.g. "CA", "US"
}

// ── Minimal typings for the NEW Places API (no @types/google.maps needed) ─────

interface AC { longText: string; shortText: string; types: string[] }
interface GMPlace {
  addressComponents?: AC[]
  fetchFields(o: { fields: string[] }): Promise<{ place: GMPlace }>
}
interface Prediction {
  mainText:      { text: string }
  secondaryText: { text: string }
  toPlace():     GMPlace
}
interface Suggestion { placePrediction: Prediction }
interface PlacesLib {
  AutocompleteSessionToken: new () => object
  AutocompleteSuggestion: {
    fetchAutocompleteSuggestions(r: {
      input:        string
      sessionToken: object
    }): Promise<{ suggestions: Suggestion[] }>
  }
}
type GoogleWindow = Window & {
  google: { maps: { importLibrary(name: string): Promise<unknown> } }
}

// ── Singleton script loader ───────────────────────────────────────────────────
// Uses loading=async + callback so importLibrary is guaranteed to exist when
// the promise resolves. (onload fires before async init completes; callback fires after.)

const MAPS_CALLBACK = "__googleMapsReady"
let scriptPromise: Promise<void> | null = null

function loadScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve()
  if ((window as unknown as { google?: { maps?: unknown } }).google?.maps) return Promise.resolve()
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise<void>((resolve, reject) => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!key) {
      console.warn("[AddressAutocomplete] NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set")
      resolve()
      return
    }
    // callback fires after async init — importLibrary is ready at that point
    ;(window as unknown as Record<string, unknown>)[MAPS_CALLBACK] = resolve
    const el   = document.createElement("script")
    el.src     = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async&callback=${MAPS_CALLBACK}`
    el.async   = true
    el.onerror = () => { scriptPromise = null; reject(new Error("Google Maps failed to load")) }
    document.head.appendChild(el)
  })
  return scriptPromise
}

// ── Address parser (new API uses longText / shortText) ────────────────────────

function parseComponents(components: AC[]): AddressResult {
  const get = (type: string, short = false): string => {
    const c = components.find((c) => c.types.includes(type))
    return short ? (c?.shortText ?? "") : (c?.longText ?? "")
  }
  return {
    line1:    [get("street_number"), get("route")].filter(Boolean).join(" "),
    city:     get("locality") || get("postal_town") || get("sublocality_level_1") || get("administrative_area_level_2"),
    postcode: get("postal_code"),
    country:  get("country", true),
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  value:        string
  onChange:     (v: string) => void
  onSelect:     (r: AddressResult) => void
  placeholder?: string
  className?:   string
  name?:        string
  required?:    boolean
  id?:          string
}

export default function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Start typing your address…",
  className,
  name,
  required,
  id,
}: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open,        setOpen]        = useState(false)
  const [placesLib,   setPlacesLib]   = useState<PlacesLib | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const tokenRef     = useRef<object | null>(null)
  const debounceRef  = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load script then import new Places library
  useEffect(() => {
    loadScript()
      .then(async () => {
        const lib = await (window as unknown as GoogleWindow)
          .google.maps.importLibrary("places") as PlacesLib
        setPlacesLib(lib)
      })
      .catch(console.error)
  }, [])

  // Reuse session token across queries; reset after selection
  function getToken(lib: PlacesLib) {
    if (!tokenRef.current) tokenRef.current = new lib.AutocompleteSessionToken()
    return tokenRef.current
  }

  const fetchSuggestions = useCallback(async (input: string) => {
    if (!placesLib || input.length < 3) { setSuggestions([]); setOpen(false); return }
    try {
      const { suggestions } = await placesLib.AutocompleteSuggestion
        .fetchAutocompleteSuggestions({ input, sessionToken: getToken(placesLib) })
      setSuggestions(suggestions)
      setOpen(suggestions.length > 0)
    } catch {
      setSuggestions([])
      setOpen(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placesLib])

  function handleChange(v: string) {
    onChange(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(v), 300)
  }

  async function handleSelect(s: Suggestion) {
    try {
      const place = s.placePrediction.toPlace()
      await place.fetchFields({ fields: ["addressComponents"] })
      if (place.addressComponents) {
        const result = parseComponents(place.addressComponents)
        onChange(result.line1)
        onSelect(result)
      }
    } catch (err) {
      console.error("[AddressAutocomplete] fetchFields failed:", err)
    }
    tokenRef.current = null   // new session after selection
    setSuggestions([])
    setOpen(false)
  }

  // Close dropdown on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <input
        id={id}
        name={name}
        required={required}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
        className={className}
      />

      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 top-full left-0 right-0 mt-1.5 bg-card border border-border rounded-xl shadow-xl overflow-hidden">
          {suggestions.map((s, i) => (
            <li key={i} className="border-b border-border last:border-0">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}  // keep focus on input
                onClick={() => handleSelect(s)}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors flex items-start gap-2.5"
              >
                <svg className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>
                  <span className="font-medium text-foreground">{s.placePrediction.mainText.text}</span>
                  <span className="text-muted-foreground ml-1 text-xs">{s.placePrediction.secondaryText.text}</span>
                </span>
              </button>
            </li>
          ))}
          {/* Required by Google ToS */}
          <li className="px-4 py-1.5 bg-muted/30">
            <p className="text-[10px] text-muted-foreground text-right select-none">Powered by Google</p>
          </li>
        </ul>
      )}
    </div>
  )
}
