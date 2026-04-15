import { auth }         from "@/auth"
import RequestForm      from "./request-form"

export const metadata = {
  title:       "Request a Perfume — Allio Cosmetics",
  description: "Looking for a perfume we don't carry? Tell us what you want and we'll source it.",
}

const STEPS = [
  {
    n:     "01",
    title: "Tell us what you want",
    desc:  "Share the brand and name of the perfume(s) you're looking for.",
  },
  {
    n:     "02",
    title: "We check availability",
    desc:  "Our team looks into stock and pricing within 48 hours.",
  },
  {
    n:     "03",
    title: "You get a quote",
    desc:  "We email you the price and expected delivery for each perfume.",
  },
  {
    n:     "04",
    title: "We order it in",
    desc:  "Once you confirm, we source your perfume and ship it to you.",
  },
]

export default async function BookPage() {
  const session = await auth()

  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-b from-primary/5 to-background border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <p className="text-xs font-semibold tracking-[0.3em] text-primary uppercase mb-4">
            Special Requests
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold font-heading text-foreground mb-5 leading-tight">
            Request a Perfume
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Can&apos;t find what you&apos;re looking for? Tell us the brand and name —
            we&apos;ll check availability and get back to you with a quote.
          </p>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid lg:grid-cols-5 gap-10 lg:gap-16">

          {/* Form — left 3 cols */}
          <div className="lg:col-span-3">
            <RequestForm
              defaultName={session?.user?.name  ?? ""}
              defaultEmail={session?.user?.email ?? ""}
            />
          </div>

          {/* Sidebar — right 2 cols */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-8">

              {/* How it works */}
              <div>
                <p className="text-xs font-semibold tracking-[0.25em] text-primary uppercase mb-6">
                  How It Works
                </p>
                <div className="space-y-6">
                  {STEPS.map((step) => (
                    <div key={step.n} className="flex gap-4">
                      <span className="text-3xl font-bold font-heading text-primary/15 leading-none mt-0.5 w-9 shrink-0 tabular-nums">
                        {step.n}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-foreground mb-1">{step.title}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tip card */}
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
                <p className="text-sm font-semibold text-foreground mb-2">Got a list?</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  You can add as many perfumes as you like in a single request — just
                  click &ldquo;Add another perfume&rdquo; in the form.
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
