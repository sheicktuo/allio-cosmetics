import { prisma } from "@/lib/prisma"
import Link from "next/link"

export const metadata = { title: "Orders — Admin" }

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
}

const ALL_STATUSES = [
  "PENDING", "CONFIRMED", "RECEIVED", "ASSESSING",
  "RECONDITIONING", "QUALITY_CHECK", "READY", "DELIVERED", "CANCELLED",
]

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  const { status: statusFilter, page: pageParam } = await searchParams
  const page    = parseInt(pageParam ?? "1")
  const perPage = 25

  const where = statusFilter ? { status: statusFilter as never } : {}

  const [orders, total] = await Promise.all([
    prisma.serviceOrder.findMany({
      where,
      take:    perPage,
      skip:    (page - 1) * perPage,
      orderBy: { createdAt: "desc" },
      include: {
        bottles: { take: 1 },
        items:   { include: { service: true }, take: 1 },
        user:    { select: { name: true, email: true } },
      },
    }),
    prisma.serviceOrder.count({ where }),
  ])

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Orders</h1>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/admin/orders"
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !statusFilter
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
          }`}
        >
          All ({total})
        </Link>
        {ALL_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              statusFilter === s
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide bg-muted/50">
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Bottle</th>
                <th className="px-5 py-3">Service</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-5 py-10 text-center text-muted-foreground">
                    No orders found
                  </td>
                </tr>
              )}
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="font-mono text-sm text-primary font-medium hover:underline">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-sm">
                    <p className="text-foreground">{order.user?.name ?? order.guestName ?? "Guest"}</p>
                    <p className="text-muted-foreground text-xs">{order.user?.email ?? order.guestEmail}</p>
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">
                    {order.bottles[0]?.brand ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">
                    {order.items[0]?.service.name ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{order.orderType}</td>
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
                  <td className="px-5 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="text-xs text-primary font-medium hover:underline">
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {total > perPage && (
          <div className="p-4 border-t border-border flex justify-between items-center text-sm text-muted-foreground">
            <span>
              Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/orders?${statusFilter ? `status=${statusFilter}&` : ""}page=${page - 1}`}
                  className="px-3 py-1.5 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Previous
                </Link>
              )}
              {page * perPage < total && (
                <Link
                  href={`/admin/orders?${statusFilter ? `status=${statusFilter}&` : ""}page=${page + 1}`}
                  className="px-3 py-1.5 border border-border rounded-lg hover:bg-muted transition-colors"
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
