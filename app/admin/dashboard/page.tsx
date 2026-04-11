import { prisma } from "@/lib/prisma"

export const metadata = { title: "Dashboard — Admin" }

// Status badge colours — intentional semantic indicators
const STATUS_BADGE: Record<string, string> = {
  PENDING:        "bg-muted text-muted-foreground",
  CONFIRMED:      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  RECEIVED:       "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  ASSESSING:      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  RECONDITIONING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  QUALITY_CHECK:  "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  READY:          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  DELIVERED:      "bg-green-200 text-green-800 dark:bg-green-900/50 dark:text-green-300",
  CANCELLED:      "bg-destructive/10 text-destructive",
  REFUNDED:       "bg-destructive/10 text-destructive",
}

export default async function AdminDashboard() {
  const [totalOrders, activeOrders, revenueAgg, recentOrders] = await Promise.all([
    prisma.serviceOrder.count(),
    prisma.serviceOrder.count({
      where: { status: { notIn: ["DELIVERED", "CANCELLED", "REFUNDED"] } },
    }),
    prisma.serviceOrder.aggregate({
      _sum: { total: true },
      where: { paymentStatus: "PAID" },
    }),
    prisma.serviceOrder.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        bottles: { take: 1 },
        items:   { include: { service: true } },
      },
    }),
  ])

  const revenue = revenueAgg._sum.total ?? 0

  const stats = [
    { label: "Total Orders",    value: totalOrders.toString(),                                              accent: "text-primary" },
    { label: "Active Orders",   value: activeOrders.toString(),                                             accent: "text-amber-500" },
    { label: "Total Revenue",   value: `CA$${(revenue / 100).toFixed(2)}`,                                 accent: "text-green-600 dark:text-green-400" },
    { label: "Avg Order Value", value: totalOrders > 0 ? `CA$${(revenue / totalOrders / 100).toFixed(2)}` : "—", accent: "text-blue-600 dark:text-blue-400" },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-8">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl p-5 border border-border">
            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.accent}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-5 border-b border-border">
          <h2 className="font-semibold text-foreground">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide border-b border-border bg-muted/50">
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Bottle</th>
                <th className="px-5 py-3">Service</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">
                    No orders yet
                  </td>
                </tr>
              )}
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3 font-mono text-sm text-foreground">{order.orderNumber}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">
                    {order.bottles[0] ? `${order.bottles[0].brand} — ${order.bottles[0].fragrance}` : "—"}
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">
                    {order.items[0]?.service.name ?? "—"}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_BADGE[order.status] ?? "bg-muted text-muted-foreground"}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm font-medium text-foreground">
                    CA${(order.total / 100).toFixed(2)}
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("en-CA")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
