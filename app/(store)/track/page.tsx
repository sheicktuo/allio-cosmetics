import Header from "@/components/layout/header"
import { prisma } from "@/lib/prisma"

export const metadata = { title: "Track Your Order — Allio Cosmetics" }

const STATUS_STEPS = [
  { key: "PENDING",        label: "Order Placed" },
  { key: "CONFIRMED",      label: "Confirmed" },
  { key: "RECEIVED",       label: "Bottle Received" },
  { key: "ASSESSING",      label: "Assessment" },
  { key: "RECONDITIONING", label: "Reconditioning" },
  { key: "QUALITY_CHECK",  label: "Quality Check" },
  { key: "READY",          label: "Ready" },
  { key: "DELIVERED",      label: "Delivered" },
]

// Status badge colours — kept intentional since they convey distinct states
const STATUS_BADGE: Record<string, string> = {
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

type Props = { searchParams: Promise<{ order?: string }> }

export default async function TrackPage({ searchParams }: Props) {
  const { order: orderNumber } = await searchParams

  const order = orderNumber
    ? await prisma.serviceOrder.findUnique({
        where:   { orderNumber },
        include: {
          items:         { include: { service: true } },
          statusHistory: { orderBy: { createdAt: "asc" } },
        },
      })
    : null

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
          Enter your order number to see the latest status of your bottle.
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
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Services</p>
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.service.name} ×{item.quantity}
                    </span>
                    <span className="font-medium text-foreground">
                      CA${(item.total / 100).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}

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
              /* Progress Timeline */
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
                            {isComplete ? "✓" : i + 1}
                          </div>
                          {i < STATUS_STEPS.length - 1 && (
                            <div className={`w-0.5 h-8 transition-colors ${isComplete ? "bg-primary" : "bg-border"}`} />
                          )}
                        </div>
                        <div className="pb-8">
                          <p className={`font-medium text-sm transition-colors ${
                            isActive    ? "text-primary"
                            : isComplete ? "text-foreground"
                            : "text-muted-foreground"
                          }`}>
                            {step.label}
                          </p>
                          {isActive && (
                            <p className="text-xs text-muted-foreground mt-0.5">Currently in progress</p>
                          )}
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
