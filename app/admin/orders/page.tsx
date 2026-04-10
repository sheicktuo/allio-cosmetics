import { prisma } from "@/lib/prisma"
import Link from "next/link"

export const metadata = { title: "Orders — Admin" }

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string; page?: string }
}) {
  const page = parseInt(searchParams.page ?? "1")
  const perPage = 25
  const statusFilter = searchParams.status

  const where = statusFilter ? { status: statusFilter as never } : {}

  const [orders, total] = await Promise.all([
    prisma.serviceOrder.findMany({
      where,
      take: perPage,
      skip: (page - 1) * perPage,
      orderBy: { createdAt: "desc" },
      include: {
        bottles: { take: 1 },
        items: { include: { service: true }, take: 1 },
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.serviceOrder.count({ where }),
  ])

  const allStatuses = [
    "PENDING", "CONFIRMED", "RECEIVED", "ASSESSING",
    "RECONDITIONING", "QUALITY_CHECK", "READY", "DELIVERED", "CANCELLED",
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
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Orders</h1>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/admin/orders"
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !statusFilter ? "bg-rose-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All ({total})
        </Link>
        {allStatuses.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              statusFilter === s ? "bg-rose-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide bg-gray-50 dark:bg-gray-800/50">
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Bottle</th>
                <th className="px-5 py-3">Service</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {orders.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-gray-400">
                    No orders found
                  </td>
                </tr>
              )}
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-5 py-3 font-mono text-sm text-rose-600 font-medium">{order.orderNumber}</td>
                  <td className="px-5 py-3 text-sm">
                    <p className="text-gray-900 dark:text-white">{order.user?.name ?? order.guestName ?? "Guest"}</p>
                    <p className="text-gray-400 text-xs">{order.user?.email ?? order.guestEmail}</p>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {order.bottles[0] ? `${order.bottles[0].brand}` : "—"}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {order.items[0]?.service.name ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">{order.orderType}</td>
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
        {total > perPage && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-sm text-gray-500">
            <span>
              Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/orders?${statusFilter ? `status=${statusFilter}&` : ""}page=${page - 1}`}
                  className="px-3 py-1.5 border rounded-lg hover:bg-gray-50 dark:border-gray-700"
                >
                  Previous
                </Link>
              )}
              {page * perPage < total && (
                <Link
                  href={`/admin/orders?${statusFilter ? `status=${statusFilter}&` : ""}page=${page + 1}`}
                  className="px-3 py-1.5 border rounded-lg hover:bg-gray-50 dark:border-gray-700"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
