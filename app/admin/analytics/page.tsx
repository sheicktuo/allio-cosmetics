import { prisma } from "@/lib/prisma"

export const metadata = { title: "Analytics — Admin" }

function fmt(cents: number) {
  return `CA$${(cents / 100).toFixed(2)}`
}

// Stripe CA pricing: 2.9% + CA$0.30 per transaction
function calcStripeFee(totalCents: number): number {
  return Math.round(totalCents * 0.029) + 30
}

const STATUS_BAR: Record<string, string> = {
  PENDING:    "bg-muted-foreground",
  CONFIRMED:  "bg-blue-500",
  PROCESSING: "bg-amber-500",
  SHIPPED:    "bg-indigo-500",
  DELIVERED:  "bg-green-600",
  CANCELLED:  "bg-destructive",
  REFUNDED:   "bg-destructive/70",
}

const revenueWhere = {
  OR: [
    { paymentStatus: "PAID"  as const },
    { status: { in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] as ("CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED")[] } },
  ],
}

export default async function AdminAnalyticsPage() {
  const now   = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - 5, 1)

  const [
    allOrders,
    statusBreakdown,
    topProductItems,
    newCustomersThisMonth,
    totalCustomers,
  ] = await Promise.all([
    prisma.order.findMany({
      where:   { ...revenueWhere, createdAt: { gte: start } },
      select:  { total: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.order.groupBy({
      by:     ["status"],
      _count: { id: true },
    }),
    prisma.orderItem.groupBy({
      by:      ["productId"],
      _sum:    { total: true },
      _count:  { id: true },
      orderBy: { _sum: { total: "desc" } },
      take:    5,
    }),
    prisma.user.count({
      where: {
        role:      "CUSTOMER",
        createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) },
      },
    }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
  ])

  const productIds = topProductItems.map((t) => t.productId)
  const products   = await prisma.product.findMany({
    where:  { id: { in: productIds } },
    select: { id: true, name: true },
  })
  const productMap = Object.fromEntries(products.map((p) => [p.id, p.name]))

  // ── Build 6-month buckets ────────────────────────────────────────────────
  const months: { label: string; gross: number; net: number; fees: number; orders: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d     = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const label = d.toLocaleDateString("en-CA", { month: "short", year: "2-digit" })
    months.push({ label, gross: 0, net: 0, fees: 0, orders: 0 })
  }
  for (const o of allOrders) {
    const d   = new Date(o.createdAt)
    const idx = months.findIndex(
      (m) => m.label === d.toLocaleDateString("en-CA", { month: "short", year: "2-digit" })
    )
    if (idx !== -1) {
      const fee = calcStripeFee(o.total)
      months[idx].gross  += o.total
      months[idx].fees   += fee
      months[idx].net    += o.total - fee
      months[idx].orders += 1
    }
  }

  const totalGross6m     = months.reduce((s, m) => s + m.gross, 0)
  const totalNet6m       = months.reduce((s, m) => s + m.net,   0)
  const totalFees6m      = months.reduce((s, m) => s + m.fees,  0)
  const totalOrders6m    = months.reduce((s, m) => s + m.orders, 0)
  const maxGross         = Math.max(...months.map((m) => m.gross), 1)
  const totalStatusCount = statusBreakdown.reduce((s, r) => s + r._count.id, 0) || 1

  const stats = [
    { label: "Gross Revenue (6 mo.)", value: fmt(totalGross6m),               accent: "text-green-600 dark:text-green-400" },
    { label: "Net Revenue (6 mo.)",   value: fmt(totalNet6m),                 accent: "text-emerald-700 dark:text-emerald-400" },
    { label: "Stripe Fees (6 mo.)",   value: fmt(totalFees6m),                accent: "text-destructive" },
    { label: "Orders (6 mo.)",        value: totalOrders6m.toString(),        accent: "text-blue-600 dark:text-blue-400" },
    { label: "Total Customers",       value: totalCustomers.toString(),       accent: "text-violet-600 dark:text-violet-400" },
    { label: "New This Month",        value: newCustomersThisMonth.toString(), accent: "text-primary" },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Analytics</h1>

      {/* Top stats — 2 col mobile, 3 col md+ */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-card rounded-xl border border-border p-5">
            <p className="text-sm text-muted-foreground mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.accent}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue bar chart (stacked gross = net + fees) */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-foreground">Revenue — Last 6 Months</h2>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-4 mb-5">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="inline-block w-3 h-3 rounded-sm bg-primary/80" />
              Net revenue
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="inline-block w-3 h-3 rounded-sm bg-destructive/40" />
              Stripe fees
            </span>
          </div>
          <div className="flex items-end gap-3 h-40">
            {months.map((m) => {
              const barH = Math.max((m.gross / maxGross) * 120, m.gross > 0 ? 4 : 0)
              const feeH = m.gross > 0 ? Math.max((m.fees / m.gross) * barH, 1) : 0
              const netH = barH - feeH
              return (
                <div key={m.label} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-xs text-muted-foreground tabular-nums leading-tight text-center">
                    {m.gross > 0 ? fmt(m.gross) : ""}
                  </span>
                  <div className="w-full flex items-end" style={{ height: "120px" }}>
                    <div className="w-full flex flex-col" style={{ height: `${barH}px` }}>
                      {feeH > 0 && (
                        <div
                          className="w-full bg-destructive/40 rounded-t-md flex-none"
                          style={{ height: `${feeH}px` }}
                        />
                      )}
                      {netH > 0 && (
                        <div
                          className={`w-full bg-primary/80 flex-none ${feeH <= 0 ? "rounded-t-md" : ""}`}
                          style={{ height: `${netH}px` }}
                        />
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{m.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Orders by status */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="font-semibold text-foreground mb-5">Orders by Status</h2>
          <div className="space-y-2.5">
            {statusBreakdown
              .sort((a, b) => b._count.id - a._count.id)
              .map((row) => {
                const pct = Math.round((row._count.id / totalStatusCount) * 100)
                return (
                  <div key={row.status}>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>{row.status}</span>
                      <span>{row._count.id} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${STATUS_BAR[row.status] ?? "bg-muted-foreground"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            {statusBreakdown.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No orders yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Revenue breakdown summary */}
      <div className="bg-card rounded-xl border border-border p-5 mb-6">
        <h2 className="font-semibold text-foreground mb-4">Revenue Breakdown (6 mo.)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Gross Revenue</p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">{fmt(totalGross6m)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total charged to customers</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Stripe Fees</p>
            <p className="text-xl font-bold text-destructive">{fmt(totalFees6m)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              2.9% + CA$0.30 × {totalOrders6m} orders
              {totalGross6m > 0 && ` (${((totalFees6m / totalGross6m) * 100).toFixed(1)}%)`}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Net Revenue</p>
            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{fmt(totalNet6m)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">After Stripe processing fees</p>
          </div>
        </div>
        {totalGross6m > 0 && (
          <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${(totalNet6m / totalGross6m) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Top products */}
      <div className="bg-card rounded-xl border border-border overflow-hidden mb-12">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Top Products by Revenue</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide bg-muted/50">
              <th className="px-5 py-3">Product</th>
              <th className="px-5 py-3">Times Ordered</th>
              <th className="px-5 py-3">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {topProductItems.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-muted-foreground">
                  No order data yet
                </td>
              </tr>
            )}
            {topProductItems.map((row, i) => (
              <tr key={row.productId} className="hover:bg-muted/30 transition-colors">
                <td className="px-5 py-3 text-sm font-medium text-foreground">
                  <span className="text-muted-foreground mr-2">#{i + 1}</span>
                  {productMap[row.productId] ?? row.productId}
                </td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{row._count.id}</td>
                <td className="px-5 py-3 text-sm font-semibold text-green-600 dark:text-green-400">
                  {fmt(row._sum.total ?? 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
