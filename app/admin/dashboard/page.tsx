import { prisma } from "@/lib/prisma"

export const metadata = { title: "Admin Dashboard" }

export default async function AdminDashboard() {
  const [totalOrders, activeOrders, totalRevenue, recentOrders] = await Promise.all([
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
        items: { include: { service: true } },
      },
    }),
  ])

  const revenue = totalRevenue._sum.total ?? 0

  const stats = [
    { label: "Total Orders", value: totalOrders.toString(), color: "text-rose-600" },
    { label: "Active Orders", value: activeOrders.toString(), color: "text-amber-600" },
    { label: "Total Revenue", value: `£${(revenue / 100).toFixed(2)}`, color: "text-emerald-600" },
    {
      label: "Avg Order Value",
      value: totalOrders > 0 ? `£${(revenue / totalOrders / 100).toFixed(2)}` : "—",
      color: "text-blue-600",
    },
  ]

  const statusColors: Record<string, string> = {
    PENDING: "bg-gray-100 text-gray-700",
    CONFIRMED: "bg-blue-100 text-blue-700",
    RECEIVED: "bg-indigo-100 text-indigo-700",
    ASSESSING: "bg-purple-100 text-purple-700",
    RECONDITIONING: "bg-amber-100 text-amber-700",
    QUALITY_CHECK: "bg-orange-100 text-orange-700",
    READY: "bg-green-100 text-green-700",
    DELIVERED: "bg-emerald-100 text-emerald-700",
    CANCELLED: "bg-red-100 text-red-700",
    REFUNDED: "bg-pink-100 text-pink-700",
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-100 dark:border-gray-800"
          >
            <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100 dark:border-gray-800">
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Bottle</th>
                <th className="px-5 py-3">Service</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-gray-400">
                    No orders yet
                  </td>
                </tr>
              )}
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-5 py-3 font-mono text-sm text-gray-900 dark:text-white">{order.orderNumber}</td>
                  <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {order.bottles[0] ? `${order.bottles[0].brand} — ${order.bottles[0].fragrance}` : "—"}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {order.items[0]?.service.name ?? "—"}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[order.status] ?? ""}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm font-medium text-gray-900 dark:text-white">
                    £{(order.total / 100).toFixed(2)}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString("en-GB")}
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
