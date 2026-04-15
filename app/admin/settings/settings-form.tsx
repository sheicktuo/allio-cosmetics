"use client"

import { useActionState, useEffect, useState } from "react"
import { toast } from "sonner"
import { saveSettings } from "./actions"
import AddressAutocomplete from "@/components/ui/address-autocomplete"

type Settings = {
  businessName:          string
  email:                 string | null
  phone:                 string | null
  address:               string | null
  city:                  string | null
  postcode:              string | null
  country:               string | null
  currency:              string
  taxLabel:              string
  deliveryFee:           number
  freeDeliveryThreshold: number
  taxRate:               number
}

// Minimal ISO code → country name map (autocomplete returns ISO codes)
const ISO_TO_NAME: Record<string, string> = {
  CA: "Canada", US: "United States", GB: "United Kingdom",
  AU: "Australia", FR: "France", DE: "Germany", NL: "Netherlands",
  BE: "Belgium", CH: "Switzerland", ES: "Spain", IT: "Italy",
  PT: "Portugal", MX: "Mexico", BR: "Brazil", JP: "Japan",
  CN: "China", IN: "India", AE: "United Arab Emirates",
}

const inputCls = "w-full px-3 py-2 text-sm border border-border rounded-lg bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
const labelCls = "block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1"

export default function SettingsForm({ settings }: { settings: Settings | null }) {
  const [state, action, pending] = useActionState(saveSettings, undefined)

  useEffect(() => {
    if (!state) return
    if (state.error)   toast.error(state.error)
    if (state.success) toast.success("Settings saved.")
  }, [state])

  // Controlled state for address fields so autocomplete can fill them
  const [address,  setAddress]  = useState(settings?.address  ?? "")
  const [city,     setCity]     = useState(settings?.city     ?? "")
  const [postcode, setPostcode] = useState(settings?.postcode ?? "")
  const [country,  setCountry]  = useState(settings?.country  ?? "")

  const s = settings

  return (
    <form action={action} className="space-y-6">
      {/* Business info */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h2 className="font-semibold text-foreground mb-4">Business Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Business Name</label>
            <input name="businessName" defaultValue={s?.businessName ?? "Allio Cosmetics"} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Contact Email</label>
            <input name="email" type="email" defaultValue={s?.email ?? ""} placeholder="hello@alliocosmetics.com" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Phone</label>
            <input name="phone" type="tel" defaultValue={s?.phone ?? ""} placeholder="+1 416 555 0100" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Currency</label>
            <select name="currency" defaultValue={s?.currency ?? "CAD"} className={`${inputCls} bg-background`}>
              <option value="CAD">CAD — Canadian Dollar</option>
              <option value="USD">USD — US Dollar</option>
              <option value="GBP">GBP — British Pound</option>
              <option value="EUR">EUR — Euro</option>
            </select>
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h2 className="font-semibold text-foreground mb-4">Business Address</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelCls}>Street Address</label>
            <AddressAutocomplete
              name="address"
              value={address}
              onChange={setAddress}
              onSelect={(r) => {
                setAddress(r.line1)
                setCity(r.city)
                setPostcode(r.postcode)
                setCountry(ISO_TO_NAME[r.country] ?? r.country)
              }}
              placeholder="123 Queen St W"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>City</label>
            <input
              name="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Toronto"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Postcode / ZIP</label>
            <input
              name="postcode"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              placeholder="M5V 2T6"
              className={inputCls}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Country</label>
            <input
              name="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Canada"
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* Fees & Taxes */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h2 className="font-semibold text-foreground mb-1">Fees &amp; Taxes</h2>
        <p className="text-xs text-muted-foreground mb-4">Applied automatically at checkout. Leave at 0 to disable.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Delivery Fee ($)</label>
            <input
              name="deliveryFee"
              type="number"
              min="0"
              step="0.01"
              defaultValue={(s?.deliveryFee ?? 0).toFixed(2)}
              placeholder="0.00"
              className={inputCls}
            />
            <p className="text-[11px] text-muted-foreground mt-1">Charged on delivery orders. Set 0 for free delivery.</p>
          </div>
          <div>
            <label className={labelCls}>Free Delivery Threshold ($)</label>
            <input
              name="freeDeliveryThreshold"
              type="number"
              min="0"
              step="0.01"
              defaultValue={(s?.freeDeliveryThreshold ?? 0).toFixed(2)}
              placeholder="0.00"
              className={inputCls}
            />
            <p className="text-[11px] text-muted-foreground mt-1">Orders at or above this amount get free delivery. Set 0 to always charge.</p>
          </div>
          <div>
            <label className={labelCls}>Tax Rate (%)</label>
            <input
              name="taxRate"
              type="number"
              min="0"
              max="100"
              step="0.01"
              defaultValue={(s?.taxRate ?? 0).toFixed(2)}
              placeholder="0.00"
              className={inputCls}
            />
            <p className="text-[11px] text-muted-foreground mt-1">e.g. 13 for 13% HST. Set 0 to disable tax.</p>
          </div>
          <div>
            <label className={labelCls}>Tax Label</label>
            <input
              name="taxLabel"
              defaultValue={s?.taxLabel ?? "Tax"}
              placeholder="HST, VAT, GST…"
              className={inputCls}
            />
            <p className="text-[11px] text-muted-foreground mt-1">Shown next to the tax line at checkout.</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="bg-primary text-primary-foreground text-sm font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save Settings"}
        </button>
      </div>
    </form>
  )
}
