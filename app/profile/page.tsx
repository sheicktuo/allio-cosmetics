import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export const metadata = { title: "My Profile" }

const STATUS_LABEL: Record<string, string> = {
  PENDING:        "Pending",
  CONFIRMED:      "Confirmed",
  RECEIVED:       "Received",
  ASSESSING:      "Assessing",
  RECONDITIONING: "Reconditioning",
  QUALITY_CHECK:  "Quality Check",
  READY:          "Ready",
  DELIVERED:      "Delivered",
  CANCELLED:      "Cancelled",
  REFUNDED:       "Refunded",
}

const STATUS_COLOR: Record<string, string> = {
  PENDING:        "bg-muted text-muted-foreground",
  CONFIRMED:      "bg-primary/15 text-primary",
  RECEIVED:       "bg-primary/15 text-primary",
  ASSESSING:      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  RECONDITIONING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  QUALITY_CHECK:  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  READY:          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  DELIVERED:      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  CANCELLED:      "bg-destructive/10 text-destructive",
  REFUNDED:       "bg-destructive/10 text-destructive",
}

export default async function ProfilePage() {
  const session = await auth()
  const userId = session!.user.id

  const [user, recentOrders, totalSpend] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, phone: true, createdAt: true, role: true },
    }),
    prisma.serviceOrder.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: {
        items: { include: { service: true }, take: 1 },
        bottles: { take: 1 },
      },
    }),
    prisma.serviceOrder.aggregate({
      where: { userId, paymentStatus: "PAID" },
      _sum: { total: true },
      _count: true,
    }),
  ])

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" })
    : "—"

  return (
    <div className="space-y-7">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground mt-1">Member since {memberSince}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Orders", value: totalSpend._count.toString() },
          {
            label: "Total Spent",
            value: totalSpend._sum.total
              ? `£${(totalSpend._sum.total / 100).toFixed(2)}`
              : "£0.00",
          },
          { label: "Account Type", value: user?.role === "SUPERADMIN" || user?.role === "ADMIN" ? "Admin" : "Customer" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{s.label}</p>
            <p className="text-2xl font-heading font-bold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Personal details */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading font-bold text-foreground">Personal Details</h2>
          <Link href="/profile/settings" className="text-xs text-primary hover:underline font-medium">
            Edit
          </Link>
        </div>
        <dl className="space-y-4">
          {[
            { label: "Full Name",     value: user?.name ?? "—" },
            { label: "Email",         value: user?.email ?? "—" },
            { label: "Phone",         value: user?.phone ?? "Not provided" },
          ].map((row) => (
            <div key={row.label} className="flex justify-between gap-4 text-sm">
              <dt className="text-muted-foreground flex-shrink-0">{row.label}</dt>
              <dd className="text-foreground font-medium text-right">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Recent orders */}
      <div className="bg-card border border-border rounded-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-heading font-bold text-foreground">Recent Orders</h2>
          <Link href="/profile/orders" className="text-xs text-primary hover:underline font-medium">
            View all
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-4xl mb-3">✨</p>
            <p className="font-heading font-semibold text-foreground mb-1">No orders yet</p>
            <p className="text-sm text-muted-foreground mb-5">
              Browse our services and send in your first bottle.
            </p>
            <Link
              href="/shop"
              className="inline-block bg-primary text-primary-foreground text-sm font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center gap-4 px-6 py-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 via-muted to-accent flex items-center justify-center flex-shrink-0 text-xl">
                  ✨
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-primary font-semibold">{order.orderNumber}</p>
                  <p className="text-sm font-medium text-foreground truncate">
                    {order.bottles[0]
                      ? `${order.bottles[0].brand} — ${order.bottles[0].fragrance}`
                      : order.items[0]?.service.name ?? "Order"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_COLOR[order.status] ?? "bg-muted text-muted-foreground"}`}>
                    {STATUS_LABEL[order.status] ?? order.status}
                  </span>
                  <p className="text-sm font-bold text-foreground">
                    £{(order.total / 100).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
