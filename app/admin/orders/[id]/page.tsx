import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import OrderActions from "./order-actions"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await prisma.serviceOrder.findUnique({ where: { id }, select: { orderNumber: true } })
  return { title: order ? `Order ${order.orderNumber} — Admin` : "Order — Admin" }
}

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

const STATUS_FLOW = [
  "PENDING", "CONFIRMED", "RECEIVED", "ASSESSING",
  "RECONDITIONING", "QUALITY_CHECK", "READY", "DELIVERED",
]

const ORDER_TYPE_LABEL: Record<string, string> = {
  MAIL_IN: "Mail In",
  DROPOFF: "Drop Off",
  PICKUP:  "Pickup / Collection",
}

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const order = await prisma.serviceOrder.findUnique({
    where: { id },
    include: {
      user:          { select: { name: true, email: true, phone: true } },
      bottles:       true,
      items:         { include: { service: true, addons: { include: { addon: true } } } },
      statusHistory: { orderBy: { createdAt: "asc" } },
      returnAddress: true,
    },
  })

  if (!order) notFound()

  const customer = order.user
    ? { name: order.user.name, email: order.user.email, phone: order.user.phone }
    : { name: order.guestName, email: order.guestEmail, phone: order.guestPhone }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/orders"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Orders
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="font-mono text-sm font-bold text-primary">{order.orderNumber}</span>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Order {order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date(order.createdAt).toLocaleDateString("en-CA", { day: "numeric", month: "long", year: "numeric" })}
            {" · "}
            {ORDER_TYPE_LABEL[order.orderType] ?? order.orderType}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${STATUS_BADGE[order.status] ?? "bg-muted text-muted-foreground"}`}>
            {order.status.replace("_", " ")}
          </span>
          <span className="text-lg font-bold text-foreground">
            CA${(order.total / 100).toFixed(2)}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column — details */}
        <div className="lg:col-span-2 space-y-6">

          {/* Bottle */}
          {order.bottles.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-semibold text-foreground mb-4">
                {order.bottles.length === 1 ? "Perfume Bottle" : `Perfume Bottles (${order.bottles.length})`}
              </h2>
              <div className="space-y-4">
                {order.bottles.map((bottle, i) => (
                  <div key={bottle.id} className="flex gap-4">
                    {bottle.photoUrl ? (
                      <div className="w-20 h-20 rounded-xl overflow-hidden border border-border shrink-0 relative">
                        <img src={bottle.photoUrl} alt="Bottle" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-muted border border-border flex items-center justify-center text-3xl shrink-0">
                        🌹
                      </div>
                    )}
                    <div>
                      {order.bottles.length > 1 && (
                        <p className="text-xs text-muted-foreground mb-1">Bottle {i + 1}</p>
                      )}
                      <p className="font-semibold text-foreground">{bottle.brand}</p>
                      <p className="text-sm text-muted-foreground">{bottle.fragrance}</p>
                      <div className="flex gap-3 mt-1.5 text-xs text-muted-foreground">
                        {bottle.bottleSize && <span>{bottle.bottleSize}</span>}
                        {bottle.condition && <span className="capitalize">{bottle.condition} condition</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Services */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground">Services</h2>
            </div>
            <div className="divide-y divide-border">
              {order.items.map((item) => (
                <div key={item.id} className="px-5 py-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">{item.service.name}</p>
                    <p className="text-sm font-semibold text-foreground">
                      CA${(item.total / 100).toFixed(2)}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Qty {item.quantity} × CA${(item.unitPrice / 100).toFixed(2)}
                  </p>
                  {item.addons.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {item.addons.map((a) => (
                        <div key={a.id} className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>+ {a.addon.name}</span>
                          <span>CA${(a.price / 100).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {item.notes && (
                    <p className="text-xs text-muted-foreground mt-1.5 italic">"{item.notes}"</p>
                  )}
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="px-5 py-4 bg-muted/30 border-t border-border space-y-1.5">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>CA${(order.subtotal / 100).toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                  <span>Discount {order.promoCode && `(${order.promoCode})`}</span>
                  <span>−CA${(order.discount / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-foreground pt-1.5 border-t border-border">
                <span>Total</span>
                <span>CA${(order.total / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Status timeline */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="font-semibold text-foreground mb-5">Status History</h2>
            <div className="relative">
              {/* Track line */}
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
              <div className="space-y-4">
                {STATUS_FLOW.map((s) => {
                  const entry = order.statusHistory.findLast((h) => h.status === s)
                  const reached = order.statusHistory.some((h) => h.status === s)
                  const isCurrent = order.status === s
                  return (
                    <div key={s} className="flex items-start gap-4 relative">
                      <div className={`w-3.5 h-3.5 rounded-full border-2 mt-0.5 shrink-0 z-10 ${
                        isCurrent ? "bg-primary border-primary" :
                        reached   ? "bg-primary/40 border-primary/40" :
                                    "bg-background border-border"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-medium ${reached ? "text-foreground" : "text-muted-foreground"}`}>
                            {s.replace("_", " ")}
                          </p>
                          {isCurrent && (
                            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">Current</span>
                          )}
                        </div>
                        {entry && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(entry.createdAt).toLocaleDateString("en-CA", {
                              day: "numeric", month: "short", year: "numeric",
                              hour: "2-digit", minute: "2-digit",
                            })}
                            {entry.note && <span className="ml-2 italic">"{entry.note}"</span>}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
                {/* Cancelled / Refunded if applicable */}
                {["CANCELLED", "REFUNDED"].includes(order.status) && (
                  <div className="flex items-start gap-4 relative">
                    <div className="w-3.5 h-3.5 rounded-full border-2 mt-0.5 shrink-0 z-10 bg-destructive border-destructive" />
                    <div>
                      <p className="text-sm font-medium text-destructive">{order.status}</p>
                      {order.statusHistory.findLast((h) => h.status === order.status) && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(order.statusHistory.findLast((h) => h.status === order.status)!.createdAt).toLocaleDateString("en-CA", {
                            day: "numeric", month: "short", year: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right column — actions + info */}
        <div className="space-y-4">
          {/* Status management (client) */}
          <OrderActions
            orderId={order.id}
            currentStatus={order.status}
            staffNotes={order.staffNotes}
            assessmentNotes={order.assessmentNotes}
          />

          {/* Customer */}
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Customer</p>
            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-foreground">{customer.name ?? "—"}</p>
              {customer.email && (
                <a href={`mailto:${customer.email}`} className="text-sm text-primary hover:underline block">
                  {customer.email}
                </a>
              )}
              {customer.phone && (
                <p className="text-sm text-muted-foreground">{customer.phone}</p>
              )}
              {!order.userId && (
                <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Guest</span>
              )}
            </div>
          </div>

          {/* Order info */}
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Order Info</p>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="text-foreground font-medium">{ORDER_TYPE_LABEL[order.orderType] ?? order.orderType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment</span>
                <span className={`font-medium ${order.paymentStatus === "PAID" ? "text-green-600 dark:text-green-400" : "text-destructive"}`}>
                  {order.paymentStatus}
                </span>
              </div>
              {order.collectionAddress && (
                <div className="pt-1 border-t border-border">
                  <p className="text-muted-foreground mb-0.5">Collection address</p>
                  <p className="text-foreground">{order.collectionAddress}</p>
                </div>
              )}
              {order.returnAddress && (
                <div className="pt-1 border-t border-border">
                  <p className="text-muted-foreground mb-0.5">Return address</p>
                  <p className="text-foreground">
                    {order.returnAddress.line1}{order.returnAddress.line2 ? `, ${order.returnAddress.line2}` : ""}<br />
                    {order.returnAddress.city}, {order.returnAddress.postcode}
                  </p>
                </div>
              )}
              {order.stripeReceiptUrl && (
                <div className="pt-1 border-t border-border">
                  <a
                    href={order.stripeReceiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary text-xs hover:underline"
                  >
                    View Stripe receipt →
                  </a>
                </div>
              )}
              {order.notes && (
                <div className="pt-1 border-t border-border">
                  <p className="text-muted-foreground mb-0.5">Customer notes</p>
                  <p className="text-foreground italic">"{order.notes}"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
