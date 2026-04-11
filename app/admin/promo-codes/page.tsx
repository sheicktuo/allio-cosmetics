import { prisma } from "@/lib/prisma"
import { togglePromoCode, deletePromoCode } from "./actions"
import CreatePromoForm from "./create-form"
import { ToggleSwitch } from "@/components/admin/toggle-switch"

export const metadata = { title: "Promo Codes — Admin" }

export default async function AdminPromoCodesPage() {
  const codes = await prisma.promoCode.findMany({ orderBy: { createdAt: "desc" } })

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Promo Codes</h1>

      <CreatePromoForm />

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide bg-muted/50">
                <th className="px-5 py-3">Code</th>
                <th className="px-5 py-3">Discount</th>
                <th className="px-5 py-3">Min Order</th>
                <th className="px-5 py-3">Uses</th>
                <th className="px-5 py-3">Expires</th>
                <th className="px-5 py-3">Active</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {codes.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-muted-foreground">
                    No promo codes yet
                  </td>
                </tr>
              )}
              {codes.map((c) => {
                const discountLabel = c.discountType === "PERCENTAGE"
                  ? `${c.discountValue}%`
                  : `CA$${(c.discountValue / 100).toFixed(2)}`
                const expired = c.expiresAt && new Date(c.expiresAt) < new Date()

                return (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-sm font-mono font-bold text-primary">{c.code}</p>
                      {c.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{c.description}</p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-foreground">{discountLabel}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">
                      {c.minOrderValue ? `CA$${(c.minOrderValue / 100).toFixed(2)}` : "None"}
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">
                      {c.usesCount}{c.maxUses ? ` / ${c.maxUses}` : ""}
                    </td>
                    <td className="px-5 py-3 text-sm">
                      {c.expiresAt ? (
                        <span className={expired ? "text-destructive" : "text-muted-foreground"}>
                          {new Date(c.expiresAt).toLocaleDateString("en-CA")}
                          {expired && " (expired)"}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Never</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <ToggleSwitch id={c.id} checked={c.isActive} action={togglePromoCode} />
                    </td>
                    <td className="px-5 py-3">
                      <form action={deletePromoCode}>
                        <input type="hidden" name="id" value={c.id} />
                        <button
                          type="submit"
                          className="text-xs text-destructive hover:opacity-70 font-medium transition-opacity"
                          onClick={(e) => {
                            if (!confirm(`Delete promo code "${c.code}"?`)) e.preventDefault()
                          }}
                        >
                          Delete
                        </button>
                      </form>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
