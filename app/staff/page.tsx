import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export const metadata = { title: "Staff — Service Queue" }

const ACTIVE_STATUSES = ["CONFIRMED", "RECEIVED", "ASSESSING", "RECONDITIONING", "QUALITY_CHECK", "READY"]

const statusColors: Record<string, string> = {
  CONFIRMED: "bg-blue-100 text-blue-700 border-blue-200",
  RECEIVED: "bg-indigo-100 text-indigo-700 border-indigo-200",
  ASSESSING: "bg-purple-100 text-purple-700 border-purple-200",
  RECONDITIONING: "bg-amber-100 text-amber-700 border-amber-200",
  QUALITY_CHECK: "bg-orange-100 text-orange-700 border-orange-200",
  READY: "bg-green-100 text-green-700 border-green-200",
}

export default async function StaffPage() {
  const session = await auth()
  if (!session || !["STAFF", "ADMIN", "SUPERADMIN"].includes(session.user?.role ?? "")) {
    redirect("/login")
  }

  const orders = await prisma.serviceOrder.findMany({
    where: { status: { in: ACTIVE_STATUSES as never[] } },
    orderBy: { createdAt: "asc" },
    include: {
      bottles: true,
      items: { include: { service: true } },
      user: { select: { name: true, email: true, phone: true } },
    },
  })

  const byStatus = ACTIVE_STATUSES.reduce(
    (acc, s) => {
      acc[s] = orders.filter((o) => o.status === s)
      return acc
    },
    {} as Record<string, typeof orders>,
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Service Queue</h1>
        <span className="text-sm text-gray-500">{orders.length} active orders</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {ACTIVE_STATUSES.map((status) => (
          <div key={status}>
            <div className="mb-3">
              <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${statusColors[status] ?? ""}`}>
                {status.replace("_", " ")}
              </span>
              <span className="ml-2 text-xs text-gray-400">{byStatus[status]?.length ?? 0}</span>
            </div>
            <div className="space-y-2">
              {byStatus[status]?.map((order) => (
                <div
                  key={order.id}
                  className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 text-sm"
                >
                  <p className="font-mono font-bold text-rose-600 text-xs mb-1">{order.orderNumber}</p>
                  {order.bottles[0] && (
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {order.bottles[0].brand}
                    </p>
                  )}
                  {order.bottles[0] && (
                    <p className="text-gray-500 text-xs truncate">{order.bottles[0].fragrance}</p>
                  )}
                  <p className="text-gray-400 text-xs mt-2">{order.items[0]?.service.name}</p>
                  <p className="text-gray-400 text-xs">
                    {order.user?.name ?? order.guestName ?? "Guest"}
                  </p>
                  <form action={`/api/orders/${order.id}/status`} method="POST" className="mt-3">
                    <button
                      type="submit"
                      className="w-full text-xs bg-rose-600 hover:bg-rose-700 text-white py-1.5 rounded-lg transition-colors"
                    >
                      Advance →
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
