import Link from "next/link"
import Header from "@/components/layout/header"

export const metadata = { title: "Collections" }

const collections = [
  {
    slug: "reconditioning",
    name: "Reconditioning",
    tagline: "Full restoration for your most treasured bottles",
    description:
      "Our signature service. Every aspect of your bottle — fragrance, hardware, and presentation — is brought back to its original standard by our expert team.",
    emoji: "✨",
    productCount: 3,
    priceFrom: 4900,
    featured: true,
    bgClass: "from-primary/20 via-primary/10 to-muted",
  },
  {
    slug: "scent-refresh",
    name: "Scent Refresh",
    tagline: "Revive the fragrance you fell in love with",
    description:
      "Fragrances fade over time. Our Scent Refresh range tops up your concentration using matched accords, restoring the original intensity and projection.",
    emoji: "🌸",
    productCount: 2,
    priceFrom: 2900,
    featured: false,
    bgClass: "from-muted via-accent to-secondary",
  },
  {
    slug: "bottle-care",
    name: "Bottle Care",
    tagline: "Crystal-clear, showroom-fresh exteriors",
    description:
      "From atomiser replacements to deep exterior cleans and personalised engravings — our Bottle Care range treats the vessel as seriously as the fragrance inside.",
    emoji: "💎",
    productCount: 3,
    priceFrom: 1200,
    featured: false,
    bgClass: "from-secondary via-muted to-accent",
  },
  {
    slug: "bespoke",
    name: "Bespoke",
    tagline: "One-of-a-kind fragrances, crafted for you",
    description:
      "Work directly with our in-house perfumers to create a signature fragrance from scratch or reimagine an existing one. A truly personal luxury.",
    emoji: "🧪",
    productCount: 1,
    priceFrom: 7900,
    featured: false,
    bgClass: "from-primary/15 via-muted to-background",
  },
]

function formatPrice(pence: number) {
  return `£${(pence / 100).toFixed(0)}`
}

export default function CollectionsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Page header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20 mb-4">
            Curated for you
          </span>
          <h1 className="text-5xl font-heading font-bold text-foreground mb-4">Our Collections</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Every collection is built around a single purpose — helping you get more from the fragrances you love.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6">
        {collections.map((col, i) => (
          <Link
            key={col.slug}
            href={`/shop?filter=${encodeURIComponent(col.name)}`}
            className="group flex flex-col md:flex-row gap-0 border border-border rounded-3xl overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300 bg-card"
          >
            {/* Visual panel — alternates sides */}
            <div
              className={`${
                i % 2 === 1 ? "md:order-2" : ""
              } md:w-2/5 bg-gradient-to-br ${col.bgClass} flex items-center justify-center p-16 min-h-[240px]`}
            >
              <span className="text-[7rem] group-hover:scale-110 transition-transform duration-500 select-none">
                {col.emoji}
              </span>
            </div>

            {/* Content panel */}
            <div className={`${i % 2 === 1 ? "md:order-1" : ""} md:w-3/5 p-10 flex flex-col justify-center`}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                  {col.productCount} product{col.productCount !== 1 ? "s" : ""}
                </span>
                {col.featured && (
                  <span className="text-xs bg-primary text-primary-foreground px-2.5 py-0.5 rounded-full font-semibold">
                    Signature
                  </span>
                )}
              </div>

              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2">
                {col.name}
              </h2>
              <p className="text-primary font-medium mb-4">{col.tagline}</p>
              <p className="text-muted-foreground leading-relaxed mb-8 max-w-lg">{col.description}</p>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Starting from</p>
                  <p className="text-2xl font-heading font-bold text-foreground">{formatPrice(col.priceFrom)}</p>
                </div>
                <span className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold text-sm group-hover:opacity-90 transition-opacity">
                  Shop {col.name}
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom CTA */}
      <section className="py-20 bg-card border-t border-border">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-4">Not sure where to start?</p>
          <h2 className="text-3xl font-heading font-bold text-foreground mb-4">
            Take our fragrance assessment
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Answer a few quick questions and we&apos;ll recommend the right collection for your bottle and budget.
          </p>
          <Link
            href="/book"
            className="inline-block bg-primary text-primary-foreground font-semibold px-8 py-3.5 rounded-xl hover:opacity-90 transition-opacity"
          >
            Start Assessment
          </Link>
        </div>
      </section>

      {/* Footer spacer */}
      <footer className="bg-foreground text-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm opacity-60">
          <p>&copy; 2026 Allio Cosmetics. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:opacity-100 transition-opacity">Privacy Policy</Link>
            <Link href="/terms" className="hover:opacity-100 transition-opacity">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
