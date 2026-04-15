import { auth }         from "@/auth"
import RequestForm      from "./request-form"

export const metadata = {
  title:       "Make a Request — Allio Cosmetics",
  description: "Have a specific product in mind? Tell us about your vision and we'll bring it to life.",
}

const STEPS = [
  {
    n:     "01",
    title: "Submit Your Request",
    desc:  "Fill in the form with as much detail as you'd like about the product you have in mind.",
  },
  {
    n:     "02",
    title: "We Review",
    desc:  "Our team reviews your request within 48 hours and evaluates feasibility and pricing.",
  },
  {
    n:     "03",
    title: "Receive a Quote",
    desc:  "We'll email you a personalised quote tailored to your exact request.",
  },
  {
    n:     "04",
    title: "Creation Begins",
    desc:  "Once you accept, we start crafting your custom product with care and intention.",
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
            Custom Orders
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold font-heading text-foreground mb-5 leading-tight">
            Make a Request
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Have a specific product in mind? Tell us about your vision —
            we&apos;ll review it and send you a personalised quote.
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
                <p className="text-sm font-semibold text-foreground mb-2">Not sure how to describe it?</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Just share a feeling, a reference product, a colour palette — anything that
                  captures what you have in mind. We&apos;ll help figure out the rest.
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
