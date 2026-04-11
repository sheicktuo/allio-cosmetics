"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import { loadStripe } from "@stripe/stripe-js"
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

type Props = {
  clientSecret: string
  orderNumber:  string
  amount:       number
}

function fmt(n: number) {
  return `CA$${(n / 100).toFixed(2)}`
}

function InnerForm({ orderNumber, amount }: { orderNumber: string; amount: number }) {
  const stripe   = useStripe()
  const elements = useElements()
  const [error,   setError]   = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    setError(null)

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?order=${orderNumber}`,
      },
    })

    // Only reaches here if there's an error (redirect happened on success)
    if (stripeError) {
      setError(stripeError.message ?? "Payment failed. Please try again.")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-heading font-bold text-foreground mb-1">Payment</h2>
        <p className="text-sm text-muted-foreground">
          Your order total is{" "}
          <span className="font-semibold text-foreground">{fmt(amount)}</span>.
          Enter your card details to confirm.
        </p>
      </div>

      <div className="rounded-xl border border-border overflow-hidden p-4 bg-background">
        <PaymentElement
          options={{
            layout: "tabs",
            fields: { billingDetails: { email: "never" } },
          }}
        />
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Processing payment…
          </>
        ) : (
          `Pay ${fmt(amount)}`
        )}
      </button>

      <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1.5">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Secured by Stripe — we never store your card details
      </p>
    </form>
  )
}

export default function PaymentForm({ clientSecret, orderNumber, amount }: Props) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: isDark ? "night" : "stripe",
          variables: {
            colorPrimary: "#b8860b",
            borderRadius: "8px",
            ...(isDark && {
              colorBackground:       "#1c1c1e",
              colorSurface:          "#2c2c2e",
              colorText:             "#f5f5f0",
              colorTextSecondary:    "#a1a1aa",
              colorTextPlaceholder:  "#71717a",
            }),
          },
        },
      }}
    >
      <InnerForm orderNumber={orderNumber} amount={amount} />
    </Elements>
  )
}
