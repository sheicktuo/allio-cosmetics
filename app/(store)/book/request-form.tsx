"use client"

import { useState, useTransition } from "react"
import { submitRequest }            from "./actions"

// ─── Styles ──────────────────────────────────────────────────────────────────

const inputCls =
  "w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground " +
  "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 " +
  "focus:border-primary transition-colors text-sm"

const fieldLabelCls = "block text-sm font-medium text-foreground mb-1.5"
const optionalCls   = "text-muted-foreground text-xs font-normal"

const CONCENTRATIONS = ["", "EDP", "EDT", "Parfum", "Oil", "Other"]
const SIZES          = ["", "30ml", "50ml", "100ml", "Other"]

// ─── Types ───────────────────────────────────────────────────────────────────

type Item = {
  brand:         string
  perfumeName:   string
  concentration: string
  size:          string
}

const emptyItem = (): Item => ({ brand: "", perfumeName: "", concentration: "", size: "" })

// ─── Form ────────────────────────────────────────────────────────────────────

export default function RequestForm({
  defaultName,
  defaultEmail,
}: {
  defaultName:  string
  defaultEmail: string
}) {
  const [name,  setName]  = useState(defaultName)
  const [email, setEmail] = useState(defaultEmail)
  const [phone, setPhone] = useState("")
  const [notes, setNotes] = useState("")

  const [items, setItems] = useState<Item[]>([emptyItem()])

  const [isPending, startTransition] = useTransition()
  const [submitted, setSubmitted]    = useState(false)
  const [error,     setError]        = useState("")

  function updateItem(idx: number, patch: Partial<Item>) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)))
  }

  function addItem() {
    setItems((prev) => [...prev, emptyItem()])
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx))
  }

  const hasValidItem = items.some((it) => it.brand.trim() && it.perfumeName.trim())
  const canSubmit    = name.trim() && email.trim() && hasValidItem

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setError("")

    // Drop blank rows, trim fields.
    const cleaned = items
      .map((it) => ({
        brand:         it.brand.trim(),
        perfumeName:   it.perfumeName.trim(),
        concentration: it.concentration.trim(),
        size:          it.size.trim(),
      }))
      .filter((it) => it.brand && it.perfumeName)

    startTransition(async () => {
      const res = await submitRequest({ name, email, phone, notes, items: cleaned })
      if (res.success) setSubmitted(true)
      else setError(res.error ?? "Something went wrong. Please try again.")
    })
  }

  // ── Success ────────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="text-center py-16 px-8 bg-primary/5 border border-primary/20 rounded-2xl">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold font-heading text-foreground mb-3">Request Sent!</h2>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
          Thank you, <span className="font-semibold text-foreground">{name.split(" ")[0]}</span>.
          We&apos;ll check availability and get back to you within 48 hours.
        </p>
      </div>
    )
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Name + Email */}
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={fieldLabelCls}>
            Name <span className="text-destructive">*</span>
          </label>
          <input
            className={inputCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            required
          />
        </div>
        <div>
          <label className={fieldLabelCls}>
            Email <span className="text-destructive">*</span>
          </label>
          <input
            className={inputCls}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />
        </div>
      </div>

      {/* Phone */}
      <div>
        <label className={fieldLabelCls}>
          Phone <span className={optionalCls}>(optional)</span>
        </label>
        <input
          className={inputCls}
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1 (000) 000-0000"
        />
      </div>

      {/* Items */}
      <div className="space-y-4 pt-2">
        <div className="flex items-baseline justify-between">
          <label className="text-sm font-medium text-foreground">
            Perfumes you&apos;re looking for <span className="text-destructive">*</span>
          </label>
          <span className={optionalCls}>
            {items.length} {items.length === 1 ? "perfume" : "perfumes"}
          </span>
        </div>

        {items.map((item, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-border bg-card/30 p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                #{idx + 1}
              </span>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <input
                className={inputCls}
                value={item.brand}
                onChange={(e) => updateItem(idx, { brand: e.target.value })}
                placeholder="Brand (e.g. Dior)"
                required={idx === 0}
              />
              <input
                className={inputCls}
                value={item.perfumeName}
                onChange={(e) => updateItem(idx, { perfumeName: e.target.value })}
                placeholder="Perfume name (e.g. Sauvage)"
                required={idx === 0}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <select
                className={inputCls}
                value={item.concentration}
                onChange={(e) => updateItem(idx, { concentration: e.target.value })}
              >
                {CONCENTRATIONS.map((c) => (
                  <option key={c} value={c}>{c || "Type (optional)"}</option>
                ))}
              </select>
              <select
                className={inputCls}
                value={item.size}
                onChange={(e) => updateItem(idx, { size: e.target.value })}
              >
                {SIZES.map((s) => (
                  <option key={s} value={s}>{s || "Size (optional)"}</option>
                ))}
              </select>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addItem}
          className="w-full py-3 rounded-xl border border-dashed border-border text-sm
                     text-muted-foreground hover:text-foreground hover:border-primary/50
                     transition-colors"
        >
          + Add another perfume
        </button>
      </div>

      {/* Notes */}
      <div>
        <label className={fieldLabelCls}>
          Notes <span className={optionalCls}>(optional)</span>
        </label>
        <textarea
          className={`${inputCls} resize-none`}
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anything else we should know — gift wrapping, specific batch, delivery preference…"
        />
      </div>

      {/* Submit */}
      <div className="space-y-3 pt-2">
        <button
          type="submit"
          disabled={isPending || !canSubmit}
          className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm
                     tracking-wide hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Sending…
            </>
          ) : (
            "Send Request"
          )}
        </button>

        <p className="text-xs text-muted-foreground text-center">
          We typically respond within 48 hours.
        </p>
      </div>
    </form>
  )
}
