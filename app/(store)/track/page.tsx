import Header from "@/components/layout/header"
import { prisma } from "@/lib/prisma"

export const metadata = { title: "Track Your Order — Allio Cosmetics" }

const DELIVERY_STEPS = [
  { key: "PENDING",    label: "Order Placed",       sub: "We've received your order" },
  { key: "CONFIRMED",  label: "Payment Confirmed",  sub: "Your payment was successful" },
  { key: "PROCESSING", label: "Being Prepared",     sub: "Your order is being packed" },
  { key: "SHIPPED",    label: "Out for Delivery",   sub: "On its way to you" },
  { key: "DELIVERED",  label: "Delivered",          sub: "Your order has arrived" },
]

const PICKUP_STEPS = [
  { key: "PENDING",    label: "Order Placed",       sub: "We've received your order" },
  { key: "CONFIRMED",  label: "Payment Confirmed",  sub: "Your payment was successful" },
  { key: "PROCESSING", label: "Being Prepared",     sub: "Your order is being packed" },
  { key: "SHIPPED",    label: "Ready for Pickup",   sub: "Come collect your order" },
  { key: "DELIVERED",  label: "Picked Up",          sub: "Order collected — enjoy!" },
]

const STATUS_BADGE: Record<string, string> = {
  PENDING:    "bg-muted text-muted-foreground",
  CONFIRMED:  "bg-primary/15 text-primary",
  PROCESSING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  SHIPPED:    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  DELIVERED:  "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  CANCELLED:  "bg-destructive/10 text-destructive",
  REFUNDED:   "bg-destructive/10 text-destructive",
}

type Props = { searchParams: Promise<{ order?: string }> }

export default async function TrackPage({ searchParams }: Props) {
  const { order: orderNumber } = await searchParams

  const order = orderNumber
    ? await prisma.order.findUnique({
        where:  { orderNumber },
        select: {
          orderNumber:      true,
          status:           true,
          deliveryMethod:   true,
          shippingName:     true,
          shippingLine1:    true,
          shippingLine2:    true,
          shippingCity:     true,
          shippingPostcode: true,
          shippingCountry:  true,
          estimatedDelivery: true,
          items: {
            select: {
              id: true, quantity: true, total: true, sizeLabel: true,
              product: { select: { name: true } },
            },
          },
          statusHistory: { orderBy: { createdAt: "asc" }, select: { status: true, createdAt: true, note: true } },
        },
      })
    : null

  const isPickup       = order?.deliveryMethod === "PICKUP"
  const STATUS_STEPS   = isPickup ? PICKUP_STEPS : DELIVERY_STEPS
  const activeStepIndex = order
    ? STATUS_STEPS.findIndex((s) => s.key === order.status)
    : -1

  const isCancelled = order?.status === "CANCELLED" || order?.status === "REFUNDED"

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-foreground mb-2">Track Your Order</h1>
        <p className="text-muted-foreground mb-10">
          Enter your order number to see the latest delivery status.
        </p>

        <form method="GET" action="/track" className="flex gap-3 mb-12">
          <input
            name="order"
            defaultValue={orderNumber}
            placeholder="Order number (e.g. AC-LK3F2M-X9P1)"
            className="flex-1 px-4 py-3 border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-primary hover:opacity-90 text-primary-foreground font-semibold rounded-xl transition-opacity"
          >
            Track
          </button>
        </form>

        {orderNumber && !order && (
          <div className="bg-card rounded-2xl border border-border p-8 text-center">
            <p className="text-5xl mb-4">🔍</p>
            <p className="font-semibold text-foreground mb-1">Order not found</p>
            <p className="text-sm text-muted-foreground">
              No order found for <span className="font-mono font-bold">{orderNumber}</span>. Double-check the number and try again.
            </p>
          </div>
        )}

        {order && (
          <div className="bg-card rounded-2xl border border-border p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Order Number</p>
                <p className="font-mono font-bold text-foreground">{order.orderNumber}</p>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_BADGE[order.status] ?? STATUS_BADGE.PENDING}`}>
                {order.status.replace(/_/g, " ")}
              </span>
            </div>

            {/* Order items */}
            {order.items.length > 0 && (
              <div className="mb-6 pb-6 border-b border-border space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Items</p>
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.product.name}{item.sizeLabel ? ` — ${item.sizeLabel}` : ""} ×{item.quantity}
                    </span>
                    <span className="font-medium text-foreground">
                      CA${(item.total / 100).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Delivery method info */}
            <div className="mb-6 pb-6 border-b border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Delivery</p>
              {isPickup ? (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">In-store pickup</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {order.status === "SHIPPED"
                        ? "Your order is ready — bring your order number and a valid ID."
                        : "We'll notify you when your order is ready for collection."}
                    </p>
                  </div>
                </div>
              ) : order.shippingLine1 ? (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{order.shippingName}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.shippingLine1}{order.shippingLine2 ? `, ${order.shippingLine2}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.shippingCity}{order.shippingPostcode ? `, ${order.shippingPostcode}` : ""} · {order.shippingCountry}
                    </p>
                    {order.estimatedDelivery && (
                      <p className="text-xs text-primary font-medium mt-1">
                        Est. delivery: {new Date(order.estimatedDelivery).toLocaleDateString("en-CA", { day: "numeric", month: "long" })}
                      </p>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            {isCancelled ? (
              <div className="text-center py-6">
                <p className="text-4xl mb-3">❌</p>
                <p className="font-semibold text-foreground">
                  Order {order.status === "REFUNDED" ? "Refunded" : "Cancelled"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  If you have questions, please contact our support team.
                </p>
              </div>
            ) : (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-4">Progress</p>
                <div className="space-y-0">
                  {STATUS_STEPS.map((step, i) => {
                    const isComplete = i < activeStepIndex
                    const isActive   = i === activeStepIndex
                    return (
                      <div key={step.key} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold transition-colors ${
                              isComplete
                                ? "bg-primary text-primary-foreground"
                                : isActive
                                ? "bg-primary/10 border-2 border-primary text-primary"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {isComplete ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : i + 1}
                          </div>
                          {i < STATUS_STEPS.length - 1 && (
                            <div className={`w-0.5 h-8 transition-colors ${isComplete ? "bg-primary" : "bg-border"}`} />
                          )}
                        </div>
                        <div className="pb-8">
                          <p className={`font-medium text-sm transition-colors ${
                            isActive     ? "text-primary"
                            : isComplete ? "text-foreground"
                            : "text-muted-foreground"
                          }`}>
                            {step.label}
                          </p>
                          <p className={`text-xs mt-0.5 ${isActive ? "text-primary/70" : "text-muted-foreground/60"}`}>
                            {isActive ? step.sub : isComplete ? step.sub : ""}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
