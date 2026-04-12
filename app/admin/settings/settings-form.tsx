"use client"

import { useActionState, useEffect } from "react"
import { toast } from "sonner"
import { saveSettings } from "./actions"

type Settings = {
  businessName: string
  email:        string | null
  phone:        string | null
  address:      string | null
  city:         string | null
  country:      string | null
  currency:     string
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
        <h2 className="font-semibold text-foreground mb-4">Address</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelCls}>Street Address</label>
            <input name="address" defaultValue={s?.address ?? ""} placeholder="123 Queen St W" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>City</label>
            <input name="city" defaultValue={s?.city ?? ""} placeholder="Toronto" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Country</label>
            <input name="country" defaultValue={s?.country ?? "Canada"} placeholder="Canada" className={inputCls} />
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
