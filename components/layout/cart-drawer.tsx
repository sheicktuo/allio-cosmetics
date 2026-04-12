"use client"

import { useState, useTransition, useSyncExternalStore } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import { useCart } from "@/store/cart"

function formatPrice(p: number) {
  return `CA$${(p / 100).toFixed(2)}`
}

// Stable subscribe no-op — useSyncExternalStore handles SSR vs client correctly
const emptySubscribe = () => () => {}

export default function CartDrawer() {
  const router = useRouter()
  const { items, increment, decrement, remove, total, count } = useCart()
  const [open, setOpen] = useState(false)
  const [, startTransition] = useTransition()

  // True only on the client — avoids hydration mismatch without setState-in-effect
  const hydrated = useSyncExternalStore(emptySubscribe, () => true, () => false)

  const subtotal = total()
  const itemCount = count()

  return (
    <>
      {/* Cart icon trigger */}
      <button
        onClick={() => setOpen(true)}
        className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        aria-label="Open cart"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        {hydrated && itemCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[1.1rem] h-[1.1rem] text-[10px] font-bold bg-primary text-primary-foreground rounded-full flex items-center justify-center leading-none px-1">
            {itemCount > 9 ? "9+" : itemCount}
          </span>
        )}
      </button>

      {/* Portal: renders backdrop + drawer directly in <body>, escaping header's backdrop-filter stacking context */}
      {hydrated && createPortal(
        <>
          {/* Backdrop */}
          {open && (
            <div
              className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
          )}

          {/* Drawer */}
          <div className={`fixed top-0 right-0 h-full w-full sm:max-w-md z-50 bg-card border-l border-border flex flex-col shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <h2 className="font-heading font-bold text-foreground">
                  Your Cart
                  {itemCount > 0 && (
                    <span className="text-xs font-normal text-muted-foreground ml-1.5">
                      ({itemCount} {itemCount === 1 ? "item" : "items"})
                    </span>
                  )}
                </h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-16 text-center px-6">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <svg className="w-7 h-7 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <p className="font-heading font-semibold text-foreground mb-1">Your cart is empty</p>
                  <p className="text-sm text-muted-foreground mb-6">Add a product to get started</p>
                  <button
                    onClick={() => { setOpen(false); router.push("/shop") }}
                    className="bg-primary text-primary-foreground text-sm font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
                  >
                    Shop Now
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 px-5 py-4">
                      <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary/15 via-muted to-accent flex items-center justify-center text-2xl shrink-0">
                        {item.emoji}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">{item.collection}</p>
                        <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {item.sizeLabel && (
                            <span className="text-xs font-medium bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                              {item.sizeLabel}
                            </span>
                          )}
                          <p className="text-xs text-muted-foreground">{formatPrice(item.price)} each</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
                          <button
                            onClick={() => decrement(item.id)}
                            className="w-6 h-6 rounded flex items-center justify-center hover:bg-card transition-colors text-muted-foreground hover:text-foreground"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="w-5 text-center text-xs font-semibold tabular-nums">{item.quantity}</span>
                          <button
                            onClick={() => increment(item.id)}
                            className="w-6 h-6 rounded flex items-center justify-center hover:bg-card transition-colors text-muted-foreground hover:text-foreground"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <p className="text-xs font-bold text-foreground tabular-nums">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                          <button
                            onClick={() => remove(item.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border shrink-0">
                <div className="px-5 py-4 space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="tabular-nums">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Shipping</span>
                    <span>TBC at checkout</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between font-heading font-bold text-foreground">
                    <span>Total</span>
                    <span className="text-primary tabular-nums">{formatPrice(subtotal)}</span>
                  </div>
                </div>
                <div className="px-5 pb-5 space-y-2">
                  <button
                    onClick={() => { setOpen(false); router.push("/checkout") }}
                    className="w-full bg-primary text-primary-foreground font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 text-sm flex items-center justify-center gap-2"
                  >
                    Checkout · {formatPrice(subtotal)}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => { setOpen(false); router.push("/shop") }}
                    className="w-full text-xs text-muted-foreground hover:text-foreground underline transition-colors py-2"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </div>
        </>,
        document.body
      )}
    </>
  )
}
