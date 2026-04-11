"use client"

import { useActionState, useEffect, useRef } from "react"
import { toast } from "sonner"
import { createPromoCode } from "./actions"

export default function CreatePromoForm() {
  const [state, action, pending] = useActionState(createPromoCode, undefined)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (!state) return
    if (state.error) toast.error(state.error)
    if (state.success) {
      toast.success("Promo code created.")
      formRef.current?.reset()
    }
  }, [state])

  return (
    <div className="bg-card rounded-xl border border-border p-5 mb-6">
      <h2 className="font-semibold text-foreground mb-4">New Promo Code</h2>
      <form ref={formRef} action={action} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Code *</label>
          <input
            name="code"
            required
            placeholder="SAVE20"
            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 uppercase"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Type *</label>
          <select
            name="discountType"
            required
            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="PERCENTAGE">Percentage (%)</option>
            <option value="FIXED">Fixed (CA$)</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Value *</label>
          <input
            name="discountValue"
            type="number"
            required
            min={0.01}
            step={0.01}
            placeholder="20"
            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Min Order (CA$)</label>
          <input
            name="minOrderValue"
            type="number"
            min={0}
            step={0.01}
            placeholder="0"
            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Max Uses</label>
          <input
            name="maxUses"
            type="number"
            min={1}
            step={1}
            placeholder="Unlimited"
            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Expires At</label>
          <input
            name="expiresAt"
            type="date"
            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="space-y-1 col-span-2 md:col-span-1">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Description</label>
          <input
            name="description"
            placeholder="Internal note"
            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={pending}
            className="w-full bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {pending ? "Creating…" : "Create Code"}
          </button>
        </div>
      </form>
    </div>
  )
}
