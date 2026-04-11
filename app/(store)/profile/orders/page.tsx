import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export const metadata = { title: "My Orders" }

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

const ORDER_TYPE_LABEL: Record<string, string> = {
  MAIL_IN:  "Mail In",
  DROPOFF:  "Drop Off",
  PICKUP:   "Collection",
}

export default async function OrdersPage() {
  const session = await auth()

  const orders = await prisma.serviceOrder.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: { include: { service: true } },
      bottles: true,
      statusHistory: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">My Orders</h1>
          <p className="text-muted-foreground mt-1">
            {orders.length} order{orders.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link
          href="/shop"
          className="hidden sm:block bg-primary text-primary-foreground text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
        >
          + New Order
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl px-6 py-16 text-center">
          <p className="text-5xl mb-4">✨</p>
          <p className="font-heading font-semibold text-foreground mb-1">No orders yet</p>
          <p className="text-sm text-muted-foreground mb-6">Your order history will appear here.</p>
          <Link
            href="/shop"
            className="inline-block bg-primary text-primary-foreground text-sm font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
          >
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-colors">
              {/* Order header */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-border bg-muted/30">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">Order</p>
                    <p className="font-mono text-sm font-bold text-primary">{order.orderNumber}</p>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">Date</p>
                    <p className="text-sm font-medium text-foreground">
                      {new Date(order.createdAt).toLocaleDateString("en-CA", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">Type</p>
                    <p className="text-sm font-medium text-foreground">
                      {ORDER_TYPE_LABEL[order.orderType] ?? order.orderType}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLOR[order.status] ?? "bg-muted text-muted-foreground"}`}>
                    {STATUS_LABEL[order.status] ?? order.status}
                  </span>
                  <p className="text-base font-heading font-bold text-foreground">
                    CA${(order.total / 100).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Bottle + services */}
              <div className="px-5 py-4">
                {order.bottles.map((bottle) => (
                  <div key={bottle.id} className="flex items-start gap-3 mb-3 last:mb-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 via-muted to-accent flex items-center justify-center text-xl flex-shrink-0">
                      🌹
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {bottle.brand} — {bottle.fragrance}
                      </p>
                      {bottle.bottleSize && (
                        <p className="text-xs text-muted-foreground">{bottle.bottleSize}</p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Services */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {order.items.map((item) => (
                    <span key={item.id} className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-full">
                      {item.service.name} ×{item.quantity}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer actions */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/20">
                <p className="text-xs text-muted-foreground">
                  {order.paymentStatus === "PAID" ? "✓ Paid" : "Payment pending"}
                </p>
                <Link
                  href={`/track?order=${order.orderNumber}`}
                  className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
                >
                  Track order
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
