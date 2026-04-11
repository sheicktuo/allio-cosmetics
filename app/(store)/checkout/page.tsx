"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useCart } from "@/store/cart"
import { createOrderAndPaymentIntent } from "./actions"
import PaymentForm from "./payment-form"
import Header from "@/components/layout/header"

function formatPrice(p: number) {
  return `CA$${(p / 100).toFixed(2)}`
}

// 0:Contact  1:Order  2:Delivery  3:Review  4:Payment
const STEPS = ["Contact", "Order", "Delivery", "Review", "Payment"]

const ORDER_TYPES = [
  { value: "DROPOFF", label: "Drop Off",        description: "Bring your bottle to our studio in person.",  emoji: "🏪" },
  { value: "PICKUP",  label: "Pick up",      description: "We pick up from your address (London only).", emoji: "🚗" },
]

const CONDITIONS = ["Excellent", "Good", "Fair", "Poor — needs assessment"]

const inputCls = "w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-sm"

export default function CheckoutPage() {
  const { items, total, clear } = useCart()
  const { data: session } = useSession()
  const subtotal = total()

  const [step,    setStep]    = useState(0)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  // Payment step state
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [orderNumber,  setOrderNumber]  = useState<string | null>(null)
  const [paidAmount,   setPaidAmount]   = useState(0)

  // Form state
  // Contact: track only explicit user edits; fall back to session data during render
  const [contactEdits, setContactEdits] = useState<Partial<{ name: string; email: string; phone: string }>>({})
  const contact = {
    name:  contactEdits.name  ?? session?.user?.name  ?? "",
    email: contactEdits.email ?? session?.user?.email ?? "",
    phone: contactEdits.phone ?? (session?.user as { phone?: string })?.phone ?? "",
  }
  function setContact(field: "name" | "email" | "phone", value: string) {
    setContactEdits((prev) => ({ ...prev, [field]: value }))
  }

  const [bottle,   setBottle]   = useState({ brand: "", fragrance: "", bottleSize: "", condition: "" })
  const [delivery, setDelivery] = useState({ orderType: "MAIL_IN", notes: "", promoCode: "" })

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-lg mx-auto px-4 py-24 text-center">
          <p className="text-6xl mb-4">🛒</p>
          <h1 className="text-2xl font-heading font-bold text-foreground mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">Add a service before checking out.</p>
          <Link href="/shop" className="inline-block bg-primary text-primary-foreground font-semibold px-8 py-3.5 rounded-xl hover:opacity-90 transition-opacity">
            Shop Now
          </Link>
        </div>
      </div>
    )
  }

  function canAdvance() {
    if (step === 0) return contact.name.trim() !== "" && contact.email.includes("@")
    if (step === 1) return bottle.brand.trim() !== "" && bottle.fragrance.trim() !== ""
    if (step === 2) return !!delivery.orderType
    return true
  }

  async function handlePlaceOrder() {
    setLoading(true)
    setError(null)

    const fd = new FormData()
    fd.set("name",        contact.name)
    fd.set("email",       contact.email)
    fd.set("phone",       contact.phone)
    fd.set("brand",       bottle.brand)
    fd.set("fragrance",   bottle.fragrance)
    fd.set("bottleSize",  bottle.bottleSize)
    fd.set("condition",   bottle.condition)
    fd.set("orderType",   delivery.orderType)
    fd.set("notes",       delivery.notes)
    fd.set("promoCode",   delivery.promoCode)
    fd.set("cartJson", JSON.stringify(items.map((i) => ({
      id: i.id, slug: i.slug, name: i.name, price: i.price, quantity: i.quantity,
    }))))

    const res = await createOrderAndPaymentIntent(fd)

    if ("error" in res) {
      setError(res.error ?? "Something went wrong.")
      setLoading(false)
      return
    }

    setClientSecret(res.clientSecret)
    setOrderNumber(res.orderNumber)
    setPaidAmount(res.amount)
    clear()
    setStep(4)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Step indicator */}
        <div className="flex items-center mb-12 max-w-2xl mx-auto">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  i < step     ? "bg-primary text-primary-foreground"
                  : i === step ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                  :              "bg-muted text-muted-foreground"
                }`}>
                  {i < step ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : i + 1}
                </div>
                <span className={`text-xs mt-1.5 font-medium whitespace-nowrap ${i === step ? "text-foreground" : "text-muted-foreground"}`}>
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-2 mb-4 transition-colors ${i < step ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-10 items-start">
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-2xl p-8">

              {error && (
                <div className="mb-6 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {error}
                </div>
              )}

              {/* ── Step 0: Contact ── */}
              {step === 0 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-heading font-bold text-foreground mb-1">Contact details</h2>
                    {session?.user ? (
                      <p className="text-sm text-muted-foreground">
                        Signed in as <span className="font-medium text-foreground">{session.user.email}</span>. You can edit the fields below.
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No account needed.{" "}
                        <Link href="/login?from=/checkout" className="text-primary hover:underline font-medium">Sign in</Link>
                        {" "}to use saved details.
                      </p>
                    )}
                  </div>
                  <Field label="Full Name" required>
                    <input value={contact.name} onChange={(e) => setContact("name", e.target.value)}
                      placeholder="Jane Smith" className={inputCls} />
                  </Field>
                  <Field label="Email" required>
                    <input type="email" value={contact.email} onChange={(e) => setContact("email", e.target.value)}
                      placeholder="jane@example.com" className={inputCls} />
                  </Field>
                  <Field label="Phone" hint="Optional — for dispatch updates">
                    <input type="tel" value={contact.phone} onChange={(e) => setContact("phone", e.target.value)}
                      placeholder="+44 7700 900000" className={inputCls} />
                  </Field>
                </div>
              )}

              {/* ── Step 1: Order ── */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-heading font-bold text-foreground mb-1">Your Order</h2>
                    <p className="text-sm text-muted-foreground">Review the services you selected and tell us about your bottle.</p>
                  </div>

                  {/* Cart items */}
                  <div className="rounded-xl border border-border overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b border-border">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Services</p>
                      <Link href="/cart" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit cart
                      </Link>
                    </div>
                    <div className="divide-y divide-border">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                          <span className="text-xl shrink-0">{item.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{item.name}</p>
                            <p className="text-xs text-muted-foreground">×{item.quantity}</p>
                          </div>
                          <p className="text-sm font-semibold text-foreground">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between px-4 py-3 border-t border-border bg-muted/30 text-sm font-bold text-foreground">
                      <span>Total</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                  </div>

                  {/* Bottle details */}
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-3">Your Bottle</p>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Brand" required>
                          <input value={bottle.brand} onChange={(e) => setBottle({ ...bottle, brand: e.target.value })}
                            placeholder="e.g. Chanel, Dior" className={inputCls} />
                        </Field>
                        <Field label="Fragrance" required>
                          <input value={bottle.fragrance} onChange={(e) => setBottle({ ...bottle, fragrance: e.target.value })}
                            placeholder="e.g. Bleu de Chanel" className={inputCls} />
                        </Field>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Bottle size" hint="Optional">
                          <input value={bottle.bottleSize} onChange={(e) => setBottle({ ...bottle, bottleSize: e.target.value })}
                            placeholder="e.g. 100ml" className={inputCls} />
                        </Field>
                        <Field label="Current condition">
                          <select value={bottle.condition} onChange={(e) => setBottle({ ...bottle, condition: e.target.value })}
                            className={inputCls}>
                            <option value="">Select condition</option>
                            {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </Field>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 2: Delivery ── */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-heading font-bold text-foreground mb-1">Delivery</h2>
                    <p className="text-sm text-muted-foreground">How would you like to get your bottle to us?</p>
                  </div>
                  <div className="space-y-3">
                    {ORDER_TYPES.map((t) => (
                      <button key={t.value} type="button"
                        onClick={() => setDelivery({ ...delivery, orderType: t.value })}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                          delivery.orderType === t.value
                            ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                            : "border-border hover:border-primary/40 hover:bg-muted/50"
                        }`}
                      >
                        <span className="text-3xl shrink-0">{t.emoji}</span>
                        <div>
                          <p className="font-semibold text-foreground text-sm">{t.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                        </div>
                        <div className={`ml-auto w-4 h-4 rounded-full border-2 shrink-0 transition-colors ${
                          delivery.orderType === t.value ? "border-primary bg-primary" : "border-border"
                        }`} />
                      </button>
                    ))}
                  </div>
                  <Field label="Promo code" hint="Optional">
                    <input value={delivery.promoCode}
                      onChange={(e) => setDelivery({ ...delivery, promoCode: e.target.value.toUpperCase() })}
                      placeholder="WELCOME10" className={`${inputCls} uppercase`} />
                  </Field>
                  <Field label="Notes for our team" hint="Optional">
                    <textarea value={delivery.notes}
                      onChange={(e) => setDelivery({ ...delivery, notes: e.target.value })}
                      rows={3} placeholder="Anything we should know about your bottle…"
                      className={`${inputCls} resize-none`} />
                  </Field>
                </div>
              )}

              {/* ── Step 3: Review ── */}
              {step === 3 && (
                <div className="space-y-5">
                  <h2 className="text-xl font-heading font-bold text-foreground">Review your order</h2>

                  {/* Contact */}
                  <Section title="Contact" onEdit={() => setStep(0)}>
                    <ReviewRow label="Name"  value={contact.name} />
                    <ReviewRow label="Email" value={contact.email} />
                    {contact.phone && <ReviewRow label="Phone" value={contact.phone} />}
                  </Section>

                  {/* Order & Bottle */}
                  <Section title="Order" onEdit={() => setStep(1)}>
                    {items.map((item) => (
                      <ReviewRow key={item.id} label={item.name} value={`${formatPrice(item.price * item.quantity)} ×${item.quantity}`} />
                    ))}
                    <ReviewRow label="Bottle" value={`${bottle.brand} — ${bottle.fragrance}`} />
                    {bottle.bottleSize && <ReviewRow label="Size"      value={bottle.bottleSize} />}
                    {bottle.condition  && <ReviewRow label="Condition" value={bottle.condition} />}
                  </Section>

                  {/* Delivery */}
                  <Section title="Delivery" onEdit={() => setStep(2)}>
                    <ReviewRow label="Method" value={ORDER_TYPES.find((t) => t.value === delivery.orderType)?.label ?? ""} />
                    {delivery.promoCode && <ReviewRow label="Promo code" value={delivery.promoCode} />}
                    {delivery.notes    && <ReviewRow label="Notes"       value={delivery.notes} />}
                  </Section>

                  <div className="flex justify-between text-base font-heading font-bold text-foreground pt-2 border-t border-border">
                    <span>Total to pay</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                </div>
              )}

              {/* ── Step 4: Payment ── */}
              {step === 4 && clientSecret && orderNumber && (
                <PaymentForm
                  clientSecret={clientSecret}
                  orderNumber={orderNumber}
                  amount={paidAmount}
                />
              )}

              {/* Navigation — hidden on payment step */}
              {step < 4 && (
                <div className="flex gap-3 mt-8">
                  {step > 0 && (
                    <button
                      onClick={() => setStep(step - 1)}
                      className="px-6 py-3 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                    >
                      Back
                    </button>
                  )}
                  {step < 3 ? (
                    <button
                      onClick={() => setStep(step + 1)}
                      disabled={!canAdvance()}
                      className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      onClick={handlePlaceOrder}
                      disabled={loading}
                      className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          Preparing payment…
                        </>
                      ) : "Proceed to Payment"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Order summary sidebar — hidden on payment step */}
          {step < 4 && (
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-2xl p-6 sticky top-24">
                <h3 className="font-heading font-bold text-foreground mb-4">Order Summary</h3>
                <div className="space-y-3 mb-5">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <span className="text-xl shrink-0">{item.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">×{item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-foreground shrink-0">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between font-heading font-bold text-foreground text-base pt-1">
                    <span>Total</span><span>{formatPrice(subtotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-foreground">{label}</label>
        {required && <span className="text-primary text-xs">*</span>}
        {hint && <span className="text-xs text-muted-foreground ml-auto">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

function Section({ title, onEdit, children }: {
  title: string; onEdit: () => void; children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/50 border-b border-border">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{title}</p>
        <button onClick={onEdit} className="text-xs text-primary font-medium hover:underline">Edit</button>
      </div>
      <div className="px-4 py-3 space-y-2">{children}</div>
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-foreground font-medium text-right">{value}</span>
    </div>
  )
}
