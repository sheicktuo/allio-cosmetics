"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useCart } from "@/store/cart"
import { createOrderAndPaymentIntent, getSavedAddresses, getCheckoutRates } from "./actions"
import PaymentForm from "./payment-form"
import Header from "@/components/layout/header"
import AddressAutocomplete from "@/components/ui/address-autocomplete"

function formatPrice(p: number) {
  return `CA$${(p / 100).toFixed(2)}`
}

// 0:Contact  1:Order  2:Delivery  3:Review  4:Payment
const STEPS = ["Contact", "Order", "Delivery", "Review", "Payment"]

const inputCls = "w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-sm"

type DeliveryMethod = "DELIVERY" | "PICKUP"
type SavedAddress = {
  id: string; label: string | null; line1: string; line2: string | null
  city: string; postcode: string; country: string; isDefault: boolean
}
type CheckoutRates = { deliveryFee: number; freeDeliveryThreshold: number; taxRate: number; taxLabel: string }

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
  const [paymentEmail, setPaymentEmail] = useState("")

  // Contact — fall back to session data, track only explicit edits
  const [contactEdits, setContactEdits] = useState<Partial<{ name: string; email: string; phone: string }>>({})
  const contact = {
    name:  contactEdits.name  ?? session?.user?.name  ?? "",
    email: contactEdits.email ?? session?.user?.email ?? "",
    phone: contactEdits.phone ?? (session?.user as { phone?: string })?.phone ?? "",
  }
  function setContact(field: "name" | "email" | "phone", value: string) {
    setContactEdits((prev) => ({ ...prev, [field]: value }))
  }

  // Delivery method + address (declared early — needed for fee computation below)
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("DELIVERY")
  const [delivery, setDelivery] = useState({
    shippingName:     "",
    shippingLine1:    "",
    shippingLine2:    "",
    shippingCity:     "",
    shippingPostcode: "",
    shippingCountry:  "CA",
    promoCode:        "",
    notes:            "",
  })

  // Checkout rates (delivery fee, tax)
  const [rates, setRates] = useState<CheckoutRates>({ deliveryFee: 0, freeDeliveryThreshold: 0, taxRate: 0, taxLabel: "Tax" })
  useEffect(() => { getCheckoutRates().then(setRates).catch(console.error) }, [])

  // Saved addresses (logged-in users)
  const [savedAddresses,    setSavedAddresses]    = useState<SavedAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)

  useEffect(() => {
    if (!session?.user?.id) return
    getSavedAddresses().then(setSavedAddresses).catch(console.error)
  }, [session?.user?.id])

  // Live fee preview — mirrors server-side logic in actions.ts
  const effectiveDeliveryFee =
    deliveryMethod === "PICKUP"
      ? 0
      : rates.freeDeliveryThreshold > 0 && subtotal >= rates.freeDeliveryThreshold
        ? 0
        : rates.deliveryFee
  const effectiveTax   = Math.round((subtotal + effectiveDeliveryFee) * rates.taxRate)
  const estimatedTotal = subtotal + effectiveDeliveryFee + effectiveTax

  function applyAddress(addr: SavedAddress) {
    setSelectedAddressId(addr.id)
    setDelivery((d) => ({
      ...d,
      shippingName:     contact.name,
      shippingLine1:    addr.line1,
      shippingLine2:    addr.line2 ?? "",
      shippingCity:     addr.city,
      shippingPostcode: addr.postcode,
      shippingCountry:  addr.country,
    }))
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-lg mx-auto px-4 py-24 text-center">
          <p className="text-6xl mb-4">🛒</p>
          <h1 className="text-2xl font-heading font-bold text-foreground mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">Add a product before checking out.</p>
          <Link href="/shop" className="inline-block bg-primary text-primary-foreground font-semibold px-8 py-3.5 rounded-xl hover:opacity-90 transition-opacity">
            Shop Now
          </Link>
        </div>
      </div>
    )
  }

  function canAdvance() {
    if (step === 0) return contact.name.trim() !== "" && contact.email.includes("@")
    if (step === 1) return true
    if (step === 2) {
      if (deliveryMethod === "PICKUP") return true
      return (
        delivery.shippingName.trim() !== "" &&
        delivery.shippingLine1.trim() !== "" &&
        delivery.shippingCity.trim() !== "" &&
        delivery.shippingPostcode.trim() !== ""
      )
    }
    return true
  }

  async function handlePlaceOrder() {
    setLoading(true)
    setError(null)

    const fd = new FormData()
    fd.set("name",           contact.name)
    fd.set("email",          contact.email)
    fd.set("phone",          contact.phone)
    fd.set("deliveryMethod", deliveryMethod)
    fd.set("notes",          delivery.notes)
    fd.set("promoCode",      delivery.promoCode)

    if (deliveryMethod === "DELIVERY") {
      fd.set("shippingName",     delivery.shippingName)
      fd.set("shippingLine1",    delivery.shippingLine1)
      fd.set("shippingLine2",    delivery.shippingLine2)
      fd.set("shippingCity",     delivery.shippingCity)
      fd.set("shippingPostcode", delivery.shippingPostcode)
      fd.set("shippingCountry",  delivery.shippingCountry)
    }

    fd.set("cartJson", JSON.stringify(items.map((i) => ({
      id:        i.id,
      productId: i.productId,
      slug:      i.slug,
      name:      i.name,
      price:     i.price,
      quantity:  i.quantity,
      sizeId:    i.sizeId,
      sizeLabel: i.sizeLabel,
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
    setPaymentEmail(contact.email)
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
                  <Field label="Phone" hint="Optional">
                    <input type="tel" value={contact.phone} onChange={(e) => setContact("phone", e.target.value)}
                      placeholder="+1 555 000 0000" className={inputCls} />
                  </Field>
                </div>
              )}

              {/* ── Step 1: Order ── */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-heading font-bold text-foreground mb-1">Your Order</h2>
                    <p className="text-sm text-muted-foreground">Review the items in your cart.</p>
                  </div>

                  <div className="rounded-xl border border-border overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b border-border">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Items</p>
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
                </div>
              )}

              {/* ── Step 2: Delivery ── */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-heading font-bold text-foreground mb-1">Delivery</h2>
                    <p className="text-sm text-muted-foreground">How would you like to receive your order?</p>
                  </div>

                  {/* Delivery method toggle */}
                  <div className="grid grid-cols-2 gap-3">
                    {(["DELIVERY", "PICKUP"] as const).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setDeliveryMethod(method)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                          deliveryMethod === method
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                        }`}
                      >
                        {method === "DELIVERY" ? (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        )}
                        <span className="text-sm font-semibold">
                          {method === "DELIVERY" ? "Ship to me" : "Pick up in store"}
                        </span>
                        <span className={`text-xs ${deliveryMethod === method ? "text-primary/70" : "text-muted-foreground"}`}>
                          {method === "DELIVERY" ? "Delivered to your address" : "Collect at our location"}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Delivery: shipping address form */}
                  {deliveryMethod === "DELIVERY" && (
                    <div className="space-y-4 pt-2">

                      {/* Saved addresses — only shown for logged-in users with at least one */}
                      {savedAddresses.length > 0 && (
                        <div className="space-y-2.5">
                          <p className="text-sm font-medium text-foreground">Saved addresses</p>
                          <div className="grid gap-2">
                            {savedAddresses.map((addr) => (
                              <button
                                key={addr.id}
                                type="button"
                                onClick={() => applyAddress(addr)}
                                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                                  selectedAddressId === addr.id
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/40 hover:bg-muted/50"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="min-w-0">
                                    {addr.label && (
                                      <p className="text-xs font-semibold text-muted-foreground mb-0.5">{addr.label}</p>
                                    )}
                                    <p className="text-sm font-medium text-foreground truncate">
                                      {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {addr.city}, {addr.postcode} · {addr.country}
                                    </p>
                                  </div>
                                  {selectedAddressId === addr.id && (
                                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                                      <svg className="w-3 h-3 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                      </svg>
                                    </div>
                                  )}
                                  {addr.isDefault && selectedAddressId !== addr.id && (
                                    <span className="text-[10px] font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded-full shrink-0">
                                      Default
                                    </span>
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                          <div className="relative py-1">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center">
                              <span className="bg-card px-3 text-xs text-muted-foreground">or enter a different address</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <Field label="Full Name" required>
                        <input value={delivery.shippingName}
                          onChange={(e) => setDelivery({ ...delivery, shippingName: e.target.value })}
                          placeholder="Jane Smith" className={inputCls} />
                      </Field>
                      <Field label="Address line 1" required>
                        <AddressAutocomplete
                          value={delivery.shippingLine1}
                          onChange={(v) => { setSelectedAddressId(null); setDelivery((d) => ({ ...d, shippingLine1: v })) }}
                          onSelect={(result) => setDelivery((d) => ({
                            ...d,
                            shippingLine1:    result.line1,
                            shippingCity:     result.city,
                            shippingPostcode: result.postcode,
                            shippingCountry:  result.country || d.shippingCountry,
                          }))}
                          placeholder="123 Main Street"
                          className={inputCls}
                        />
                      </Field>
                      <Field label="Address line 2" hint="Optional">
                        <input value={delivery.shippingLine2}
                          onChange={(e) => setDelivery({ ...delivery, shippingLine2: e.target.value })}
                          placeholder="Apartment, suite, unit…" className={inputCls} />
                      </Field>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="City" required>
                          <input value={delivery.shippingCity}
                            onChange={(e) => setDelivery({ ...delivery, shippingCity: e.target.value })}
                            placeholder="Toronto" className={inputCls} />
                        </Field>
                        <Field label="Postcode / ZIP" required>
                          <input value={delivery.shippingPostcode}
                            onChange={(e) => setDelivery({ ...delivery, shippingPostcode: e.target.value })}
                            placeholder="M5V 2T6" className={inputCls} />
                        </Field>
                      </div>
                      <Field label="Country" required>
                        <select
                          value={delivery.shippingCountry}
                          onChange={(e) => setDelivery({ ...delivery, shippingCountry: e.target.value })}
                          className={`${inputCls} bg-background`}
                        >
                          <option value="CA">Canada</option>
                          <option value="US">United States</option>
                          <option value="GB">United Kingdom</option>
                          <option value="AU">Australia</option>
                          <option value="FR">France</option>
                          <option value="DE">Germany</option>
                        </select>
                      </Field>
                    </div>
                  )}

                  {/* Pickup: store info */}
                  {deliveryMethod === "PICKUP" && (
                    <div className="rounded-xl border border-border bg-muted/30 p-5 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <svg className="w-4.5 h-4.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">Allio Cosmetics</p>
                          <p className="text-sm text-muted-foreground">We&apos;ll contact you once your order is ready for pickup.</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground pl-12">
                        Bring your order confirmation and a valid ID. Orders are held for 7 days.
                      </p>
                    </div>
                  )}

                  {/* Promo code & notes — always visible */}
                  <div className="space-y-4 pt-2">
                    <Field label="Promo code" hint="Optional">
                      <input value={delivery.promoCode}
                        onChange={(e) => setDelivery({ ...delivery, promoCode: e.target.value.toUpperCase() })}
                        placeholder="WELCOME10" className={`${inputCls} uppercase`} />
                    </Field>
                    <Field label="Order notes" hint="Optional">
                      <textarea value={delivery.notes}
                        onChange={(e) => setDelivery({ ...delivery, notes: e.target.value })}
                        rows={3} placeholder="Any special instructions…"
                        className={`${inputCls} resize-none`} />
                    </Field>
                  </div>
                </div>
              )}

              {/* ── Step 3: Review ── */}
              {step === 3 && (
                <div className="space-y-5">
                  <h2 className="text-xl font-heading font-bold text-foreground">Review your order</h2>

                  <Section title="Contact" onEdit={() => setStep(0)}>
                    <ReviewRow label="Name"  value={contact.name} />
                    <ReviewRow label="Email" value={contact.email} />
                    {contact.phone && <ReviewRow label="Phone" value={contact.phone} />}
                  </Section>

                  <Section title="Items" onEdit={() => setStep(1)}>
                    {items.map((item) => (
                      <ReviewRow key={item.id} label={item.name} value={`${formatPrice(item.price * item.quantity)} ×${item.quantity}`} />
                    ))}
                  </Section>

                  <Section title="Delivery" onEdit={() => setStep(2)}>
                    <ReviewRow label="Method" value={deliveryMethod === "PICKUP" ? "In-store pickup" : "Ship to address"} />
                    {deliveryMethod === "DELIVERY" && (
                      <>
                        <ReviewRow label="Name"    value={delivery.shippingName} />
                        <ReviewRow label="Address" value={[delivery.shippingLine1, delivery.shippingLine2].filter(Boolean).join(", ")} />
                        <ReviewRow label="City"    value={`${delivery.shippingCity}, ${delivery.shippingPostcode}`} />
                        <ReviewRow label="Country" value={delivery.shippingCountry} />
                      </>
                    )}
                    {delivery.promoCode && <ReviewRow label="Promo code" value={delivery.promoCode} />}
                    {delivery.notes    && <ReviewRow label="Notes"       value={delivery.notes} />}
                  </Section>

                  <div className="space-y-2 pt-2 border-t border-border text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Delivery</span>
                      <span>
                        {deliveryMethod === "PICKUP"
                          ? <span className="text-primary font-medium">Pickup — Free</span>
                          : effectiveDeliveryFee === 0
                            ? <span className="text-primary font-medium">Free</span>
                            : formatPrice(effectiveDeliveryFee)
                        }
                      </span>
                    </div>
                    {rates.taxRate > 0 && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>{rates.taxLabel} ({(rates.taxRate * 100).toFixed(0)}%)</span>
                        <span>{formatPrice(effectiveTax)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-heading font-bold text-foreground text-base pt-1 border-t border-border">
                      <span>Estimated Total</span>
                      <span>{formatPrice(estimatedTotal)}</span>
                    </div>
                    {delivery.promoCode && (
                      <p className="text-xs text-primary">
                        Promo code <span className="font-semibold">{delivery.promoCode}</span> will be applied automatically.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* ── Step 4: Payment ── */}
              {step === 4 && clientSecret && orderNumber && (
                <PaymentForm
                  clientSecret={clientSecret}
                  orderNumber={orderNumber}
                  amount={paidAmount}
                  email={paymentEmail}
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
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery</span>
                    <span>
                      {deliveryMethod === "PICKUP"
                        ? <span className="text-primary font-medium">Pickup — Free</span>
                        : effectiveDeliveryFee === 0
                          ? <span className="text-primary font-medium">Free</span>
                          : formatPrice(effectiveDeliveryFee)
                      }
                    </span>
                  </div>
                  {rates.taxRate > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>{rates.taxLabel} ({(rates.taxRate * 100).toFixed(0)}%)</span>
                      <span>{formatPrice(effectiveTax)}</span>
                    </div>
                  )}
                  {delivery.promoCode && (
                    <div className="flex justify-between text-primary text-xs">
                      <span>Promo ({delivery.promoCode})</span>
                      <span>Applied at checkout</span>
                    </div>
                  )}
                  <div className="flex justify-between font-heading font-bold text-foreground text-base pt-2 border-t border-border">
                    <span>Estimated Total</span>
                    <span>{formatPrice(estimatedTotal)}</span>
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
