"use client"

import Link from "next/link"
import Header from "@/components/layout/header"
import { useCart } from "@/store/cart"

function formatPrice(pence: number) {
  return `CA$${(pence / 100).toFixed(2)}`
}

export default function CartPage() {
  const { items, increment, decrement, remove, total, clear } = useCart()
  const subtotal = total()
  const freeReturns = subtotal >= 7500

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Your Cart</h1>
        <p className="text-muted-foreground mb-10">
          {items.length === 0
            ? "Your cart is empty."
            : `${items.reduce((s, i) => s + i.quantity, 0)} item${items.reduce((s, i) => s + i.quantity, 0) !== 1 ? "s" : ""}`}
        </p>

        {items.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-7xl mb-6">🛍️</p>
            <p className="text-xl font-heading font-semibold text-foreground mb-2">Nothing here yet</p>
            <p className="text-muted-foreground mb-8">Browse our collections and find your perfect fragrance.</p>
            <Link
              href="/shop"
              className="inline-block bg-primary text-primary-foreground font-semibold px-8 py-3.5 rounded-xl hover:opacity-90 transition-opacity"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-5 bg-card border border-border rounded-2xl p-5"
                >
                  {/* Emoji image */}
                  <div className="w-16 h-16 shrink-0 bg-linear-to-br from-primary/15 via-muted to-accent rounded-xl flex items-center justify-center text-3xl">
                    {item.emoji}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">{item.collection}</p>
                    <Link
                      href={`/shop/product/${item.slug}`}
                      className="font-heading font-semibold text-foreground hover:text-primary transition-colors leading-snug block truncate"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm font-semibold text-foreground mt-1">{formatPrice(item.price)}</p>
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => decrement(item.id)}
                      className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors text-lg leading-none"
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-semibold text-foreground">{item.quantity}</span>
                    <button
                      onClick={() => increment(item.id)}
                      className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors text-lg leading-none"
                    >
                      +
                    </button>
                  </div>

                  {/* Line total + remove */}
                  <div className="shrink-0 text-right">
                    <p className="font-bold text-foreground">{formatPrice(item.price * item.quantity)}</p>
                    <button
                      onClick={() => remove(item.id)}
                      className="text-xs text-muted-foreground hover:text-destructive transition-colors mt-1"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={clear}
                className="text-sm text-muted-foreground hover:text-destructive transition-colors pt-2"
              >
                Clear cart
              </button>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-2xl p-6 sticky top-24">
                <h2 className="font-heading font-bold text-foreground text-lg mb-6">Order Summary</h2>

                <div className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="text-foreground font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span className="text-foreground font-medium">Calculated at checkout</span>
                  </div>
                  {freeReturns && (
                    <div className="flex items-center gap-2 text-primary text-xs pt-1">
                      <span>✓</span>
                      <span>Free returns included</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-border pt-4 mb-6">
                  <div className="flex justify-between">
                    <span className="font-heading font-bold text-foreground">Total</span>
                    <span className="font-heading font-bold text-foreground text-xl">{formatPrice(subtotal)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Includes taxes</p>
                </div>

                <Link
                  href="/checkout"
                  className="w-full block text-center bg-primary text-primary-foreground font-semibold py-4 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                >
                  Proceed to Checkout
                </Link>

                <Link
                  href="/shop"
                  className="w-full block text-center text-sm text-muted-foreground hover:text-foreground transition-colors mt-4"
                >
                  ← Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
