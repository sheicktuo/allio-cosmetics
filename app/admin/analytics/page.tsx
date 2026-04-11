import { prisma } from "@/lib/prisma"

export const metadata = { title: "Analytics — Admin" }

function fmt(cents: number) {
  return `CA$${(cents / 100).toFixed(2)}`
}

// Status bar colours — intentional distinct-state indicators
const STATUS_BAR: Record<string, string> = {
  PENDING:        "bg-muted-foreground",
  CONFIRMED:      "bg-blue-500",
  RECEIVED:       "bg-indigo-500",
  ASSESSING:      "bg-purple-500",
  RECONDITIONING: "bg-amber-500",
  QUALITY_CHECK:  "bg-orange-500",
  READY:          "bg-green-500",
  DELIVERED:      "bg-green-600",
  CANCELLED:      "bg-destructive",
  REFUNDED:       "bg-destructive/70",
}

export default async function AdminAnalyticsPage() {
  const now   = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - 5, 1)

  const [
    allOrders,
    statusBreakdown,
    topServiceItems,
    newCustomersThisMonth,
    totalCustomers,
  ] = await Promise.all([
    prisma.serviceOrder.findMany({
      where:   { paymentStatus: "PAID", createdAt: { gte: start } },
      select:  { total: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.serviceOrder.groupBy({
      by:      ["status"],
      _count:  { id: true },
    }),
    prisma.serviceOrderItem.groupBy({
      by:      ["serviceId"],
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

  const serviceIds = topServiceItems.map((t) => t.serviceId)
  const services   = await prisma.service.findMany({
    where:  { id: { in: serviceIds } },
    select: { id: true, name: true },
  })
  const serviceMap = Object.fromEntries(services.map((s) => [s.id, s.name]))

  // Build 6-month revenue buckets
  const months: { label: string; revenue: number; orders: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d     = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const label = d.toLocaleDateString("en-CA", { month: "short", year: "2-digit" })
    months.push({ label, revenue: 0, orders: 0 })
  }
  for (const o of allOrders) {
    const d   = new Date(o.createdAt)
    const idx = months.findIndex(
      (m) => m.label === d.toLocaleDateString("en-CA", { month: "short", year: "2-digit" })
    )
    if (idx !== -1) { months[idx].revenue += o.total; months[idx].orders += 1 }
  }

  const totalRevenue6m = months.reduce((s, m) => s + m.revenue, 0)
  const totalOrders6m  = months.reduce((s, m) => s + m.orders, 0)
  const maxRevenue     = Math.max(...months.map((m) => m.revenue), 1)
  const totalStatusCount = statusBreakdown.reduce((s, r) => s + r._count.id, 0) || 1

  const stats = [
    { label: "Revenue (6 mo.)", value: fmt(totalRevenue6m),           accent: "text-green-600 dark:text-green-400" },
    { label: "Orders (6 mo.)",  value: totalOrders6m.toString(),      accent: "text-blue-600 dark:text-blue-400" },
    { label: "Total Customers", value: totalCustomers.toString(),     accent: "text-violet-600 dark:text-violet-400" },
    { label: "New This Month",  value: newCustomersThisMonth.toString(), accent: "text-primary" },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Analytics</h1>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-card rounded-xl border border-border p-5">
            <p className="text-sm text-muted-foreground mb-1">{s.label}</p>
            <p className={`text-3xl font-bold ${s.accent}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue bar chart */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="font-semibold text-foreground mb-5">Revenue — Last 6 Months</h2>
          <div className="flex items-end gap-3 h-40">
            {months.map((m) => (
              <div key={m.label} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-xs text-muted-foreground tabular-nums">
                  {m.revenue > 0 ? fmt(m.revenue) : ""}
                </span>
                <div
                  className="w-full rounded-t-md bg-primary/80 transition-all"
                  style={{ height: `${Math.max((m.revenue / maxRevenue) * 120, m.revenue > 0 ? 4 : 0)}px` }}
                />
                <span className="text-[10px] text-muted-foreground">{m.label}</span>
              </div>
            ))}
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

      {/* Top services */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Top Services by Revenue</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide bg-muted/50">
              <th className="px-5 py-3">Service</th>
              <th className="px-5 py-3">Times Ordered</th>
              <th className="px-5 py-3">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {topServiceItems.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-muted-foreground">
                  No order data yet
                </td>
              </tr>
            )}
            {topServiceItems.map((row, i) => (
              <tr key={row.serviceId} className="hover:bg-muted/30 transition-colors">
                <td className="px-5 py-3 text-sm font-medium text-foreground">
                  <span className="text-muted-foreground mr-2">#{i + 1}</span>
                  {serviceMap[row.serviceId] ?? row.serviceId}
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
