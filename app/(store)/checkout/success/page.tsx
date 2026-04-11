import Link from "next/link"
import Header from "@/components/layout/header"

export const metadata = { title: "Order Confirmed — Allio Cosmetics" }

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; redirect_status?: string }>
}) {
  const { order: orderNumber, redirect_status } = await searchParams
  const paymentFailed = redirect_status === "failed"

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        {paymentFailed ? (
          <>
            <div className="w-20 h-20 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-8">
              <svg className="w-9 h-9 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-4xl font-heading font-bold text-foreground mb-3">Payment failed</h1>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Your payment wasn&apos;t processed. Your order has been saved — please try again or use a different card.
            </p>
            <Link
              href="/checkout"
              className="inline-block bg-primary text-primary-foreground font-semibold px-8 py-3.5 rounded-xl hover:opacity-90 transition-opacity"
            >
              Try Again
            </Link>
          </>
        ) : (
          <>
            <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-8">
              <svg className="w-9 h-9 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-4xl font-heading font-bold text-foreground mb-3">Order confirmed!</h1>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Thank you for choosing Allio Cosmetics. We&apos;ve received your order and will be in touch shortly with next steps.
            </p>

            {orderNumber && (
              <div className="inline-block bg-card border border-border rounded-xl px-6 py-4 mb-8">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Order number</p>
                <p className="font-mono font-bold text-primary text-lg">{orderNumber}</p>
              </div>
            )}

            <div className="bg-card border border-border rounded-2xl p-6 text-left mb-8 space-y-4">
              <h2 className="font-heading font-semibold text-foreground text-sm uppercase tracking-wide">What happens next</h2>
              {[
                { step: "1", text: "You'll receive a confirmation email with your order details." },
                { step: "2", text: "Send or drop off your bottle using your chosen delivery method." },
                { step: "3", text: "We'll assess your bottle and confirm the final cost before starting work." },
                { step: "4", text: "Once complete, your bottle is returned insured to your door." },
              ].map((s) => (
                <div key={s.step} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {s.step}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.text}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {orderNumber && (
                <Link
                  href={`/track?order=${orderNumber}`}
                  className="bg-primary text-primary-foreground font-semibold px-8 py-3.5 rounded-xl hover:opacity-90 transition-opacity"
                >
                  Track My Order
                </Link>
              )}
              <Link
                href="/shop"
                className="border border-border text-foreground font-semibold px-8 py-3.5 rounded-xl hover:bg-muted transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
