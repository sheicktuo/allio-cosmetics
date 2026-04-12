import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export const metadata = { title: "My Orders" }

const STATUS_LABEL: Record<string, string> = {
  PENDING:    "Pending",
  CONFIRMED:  "Confirmed",
  PROCESSING: "Processing",
  SHIPPED:    "Shipped",
  DELIVERED:  "Delivered",
  CANCELLED:  "Cancelled",
  REFUNDED:   "Refunded",
}

const STATUS_COLOR: Record<string, string> = {
  PENDING:    "bg-muted text-muted-foreground",
  CONFIRMED:  "bg-primary/15 text-primary",
  PROCESSING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  SHIPPED:    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  DELIVERED:  "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  CANCELLED:  "bg-destructive/10 text-destructive",
  REFUNDED:   "bg-destructive/10 text-destructive",
}

export default async function OrdersPage() {
  const session = await auth()

  const user = await prisma.user.findUnique({
    where:  { email: session!.user.email! },
    select: { id: true },
  })

  const orders = await prisma.order.findMany({
    where:   { userId: user?.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: { include: { product: true } },
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
          + Shop
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl px-6 py-16 text-center">
          <p className="text-5xl mb-4">🛍️</p>
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
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit" })}
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

              {/* Items */}
              <div className="px-5 py-4">
                <div className="flex flex-wrap gap-2">
                  {order.items.map((item) => (
                    <span key={item.id} className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-full">
                      {item.product.name}{item.sizeLabel ? ` — ${item.sizeLabel}` : ""} ×{item.quantity}
                    </span>
                  ))}
                </div>
                {(order.shippingCity || order.shippingCountry) && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Ship to: {[order.shippingCity, order.shippingCountry].filter(Boolean).join(", ")}
                  </p>
                )}
              </div>

              {/* Footer */}
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
