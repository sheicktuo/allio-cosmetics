import Link from "next/link"
import Image from "next/image"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { getActiveCategories, categoryEmoji } from "@/lib/shop"

export const metadata = { title: "Collections — Allio Cosmetics" }

function formatPrice(cents: number) {
  return `CA$${(cents / 100).toFixed(0)}`
}

const BG_CLASSES = [
  "from-primary/20 via-primary/10 to-muted",
  "from-muted via-accent to-secondary",
  "from-secondary via-muted to-accent",
  "from-primary/15 via-muted to-background",
]

export default async function CollectionsPage() {
  const categories = await getActiveCategories()

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
        {categories.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-5xl mb-4">📦</p>
            <p className="text-lg font-heading font-semibold text-foreground mb-1">No collections yet</p>
            <p>Check back soon.</p>
          </div>
        )}
        {categories.map((cat, i) => {
          const emoji   = cat.imageUrl ? null : categoryEmoji(cat.slug)
          const bgClass = BG_CLASSES[i % BG_CLASSES.length]

          return (
            <Link
              key={cat.slug}
              href={`/shop?filter=${encodeURIComponent(cat.name)}`}
              className="group flex flex-col md:flex-row gap-0 border border-border rounded-3xl overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300 bg-card"
            >
              {/* Visual panel — alternates sides */}
              <div
                className={`${
                  i % 2 === 1 ? "md:order-2" : ""
                } relative md:w-2/5 bg-gradient-to-br ${bgClass} flex items-center justify-center p-16 min-h-[240px] overflow-hidden`}
              >
                {cat.imageUrl ? (
                  <Image src={cat.imageUrl} alt={cat.name} fill className="object-cover rounded-xl" />
                ) : (
                  <span className="text-[7rem] group-hover:scale-110 transition-transform duration-500 select-none">
                    {emoji}
                  </span>
                )}
              </div>

              {/* Content panel */}
              <div className={`${i % 2 === 1 ? "md:order-1" : ""} md:w-3/5 p-10 flex flex-col justify-center`}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                    {cat._count.products} product{cat._count.products !== 1 ? "s" : ""}
                  </span>
                </div>

                <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2">
                  {cat.name}
                </h2>
                {cat.description && (
                  <p className="text-muted-foreground leading-relaxed mb-8 max-w-lg">{cat.description}</p>
                )}

                <div className="flex items-center justify-end">
                  <span className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold text-sm group-hover:opacity-90 transition-opacity">
                    Shop {cat.name}
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
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

      <Footer />
    </div>
  )
}
