import { notFound } from "next/navigation"
import Link from "next/link"
import Header from "@/components/layout/header"
import { getProductBySlug, getRelatedProducts, products } from "@/lib/products"
import AddToCartButton from "@/components/shop/add-to-cart-button"
import { Badge } from "@/components/ui/badge"

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug)
  if (!product) return {}
  return {
    title: `${product.name} — Allio Cosmetics`,
    description: product.description,
  }
}

function formatPrice(pence: number) {
  return `£${(pence / 100).toFixed(0)}`
}

function StarRating({ rating, reviews }: { rating: number; reviews: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-primary text-lg">
        {"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}
      </span>
      <span className="text-sm font-semibold text-foreground">{rating.toFixed(1)}</span>
      <span className="text-sm text-muted-foreground">({reviews} reviews)</span>
    </div>
  )
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug)
  if (!product) notFound()

  const related = getRelatedProducts(product, 3)
  const savings = product.originalPrice ? product.originalPrice - product.price : null

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/shop" className="hover:text-foreground transition-colors">Shop</Link>
            <span>/</span>
            <Link
              href={`/shop?filter=${encodeURIComponent(product.collection)}`}
              className="hover:text-foreground transition-colors"
            >
              {product.collection}
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product detail */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid lg:grid-cols-2 gap-14 items-start">

          {/* Visual */}
          <div className="sticky top-24">
            <div className="relative bg-gradient-to-br from-primary/15 via-muted to-accent rounded-3xl aspect-square flex items-center justify-center overflow-hidden">
              <span className="text-[10rem]">{product.emoji}</span>
              {product.badge && (
                <Badge className="absolute top-5 left-5 bg-primary text-primary-foreground border-0 text-sm px-3 py-1">
                  {product.badge}
                </Badge>
              )}
              {product.originalPrice && (
                <Badge className="absolute top-5 right-5 bg-destructive text-white border-0 text-sm px-3 py-1">
                  Sale
                </Badge>
              )}
            </div>

            {/* Trust signals */}
            <div className="grid grid-cols-3 gap-3 mt-5">
              {[
                { emoji: "🚚", label: "Free returns", sub: "over £75" },
                { emoji: "🛡️", label: "Insured", sub: "in transit" },
                { emoji: "⚡", label: "Fast dispatch", sub: product.turnaround },
              ].map((t) => (
                <div key={t.label} className="bg-card border border-border rounded-xl p-3 text-center">
                  <div className="text-2xl mb-1">{t.emoji}</div>
                  <p className="text-xs font-semibold text-foreground">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-7">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
                {product.brand} · {product.collection}
              </p>
              <h1 className="text-4xl font-heading font-bold text-foreground leading-tight mb-4">
                {product.name}
              </h1>
              <StarRating rating={product.rating} reviews={product.reviews} />
            </div>

            {/* Price */}
            <div className="flex items-end gap-4">
              <span className="text-4xl font-heading font-bold text-foreground">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-muted-foreground line-through mb-0.5">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400 mb-0.5">
                    Save {formatPrice(savings!)}
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <div className="space-y-3">
              <p className="text-muted-foreground leading-relaxed">{product.longDescription}</p>
            </div>

            {/* What's included */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-heading font-bold text-foreground mb-4">What&apos;s included</h3>
              <ul className="space-y-2.5">
                {product.includes.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="text-primary mt-0.5 flex-shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-5 pt-4 border-t border-border flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Estimated turnaround:</span>
                <span className="font-semibold text-foreground">{product.turnaround}</span>
              </div>
            </div>

            {/* CTA */}
            <div className="space-y-3">
              <AddToCartButton product={product} />
              <Link
                href="/book"
                className="w-full block text-center border border-border text-foreground font-semibold py-3.5 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all text-sm"
              >
                Book a Consultation Instead
              </Link>
            </div>

            {/* Fine print */}
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              By adding to cart you agree to our{" "}
              <Link href="/terms" className="underline hover:text-foreground">Terms of Service</Link>.
              Prices shown include VAT. Free insured returns on orders over £75.
            </p>
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section className="py-16 border-t border-border bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-heading font-bold text-foreground mb-8">You might also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {related.map((p) => (
                <Link
                  key={p.id}
                  href={`/shop/product/${p.slug}`}
                  className="group border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all bg-card"
                >
                  <div className="aspect-square bg-gradient-to-br from-primary/10 via-muted to-accent flex items-center justify-center">
                    <span className="text-6xl group-hover:scale-110 transition-transform duration-500">
                      {p.emoji}
                    </span>
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{p.collection}</p>
                    <h3 className="font-heading font-semibold text-foreground mb-2">{p.name}</h3>
                    <p className="text-sm font-bold text-foreground">{formatPrice(p.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
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
