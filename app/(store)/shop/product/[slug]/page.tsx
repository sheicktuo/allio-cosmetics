import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import Header from "@/components/layout/header"
import AddToCartButton from "@/components/shop/add-to-cart-button"
import { Badge } from "@/components/ui/badge"
import { getServiceBySlug, getActiveServices } from "@/lib/shop"

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const services = await getActiveServices()
  return services.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const service = await getServiceBySlug(slug)
  if (!service) return {}
  return {
    title:       `${service.name} — Allio Cosmetics`,
    description: service.description ?? undefined,
  }
}

function formatPrice(cents: number) {
  return `CA$${(cents / 100).toFixed(0)}`
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const service = await getServiceBySlug(slug)
  if (!service) notFound()

  // Related: other services in the same category
  const allServices = await getActiveServices()
  const related = allServices
    .filter((s) => s.id !== service.id && s.category.id === service.category.id)
    .slice(0, 3)
    // If not enough, fill from other categories
    .concat(
      allServices
        .filter((s) => s.id !== service.id && s.category.id !== service.category.id)
        .slice(0, Math.max(0, 3 - allServices.filter((s) => s.id !== service.id && s.category.id === service.category.id).length))
    )
    .slice(0, 3)

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
              href={`/shop?filter=${encodeURIComponent(service.category.name)}`}
              className="hover:text-foreground transition-colors"
            >
              {service.category.name}
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">{service.name}</span>
          </nav>
        </div>
      </div>

      {/* Product detail */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid lg:grid-cols-2 gap-14 items-start">

          {/* Visual */}
          <div className="sticky top-24">
            <div className="relative bg-gradient-to-br from-primary/15 via-muted to-accent rounded-3xl aspect-square flex items-center justify-center overflow-hidden">
              {service.imageUrl ? (
                <Image src={service.imageUrl} alt={service.name} fill className="object-cover" />
              ) : (
                <span className="text-[10rem]">{service.emoji}</span>
              )}
              {service.isFeatured && (
                <Badge className="absolute top-5 left-5 bg-primary text-primary-foreground border-0 text-sm px-3 py-1">
                  Featured
                </Badge>
              )}
            </div>

            {/* Trust signals */}
            <div className="grid grid-cols-3 gap-3 mt-5">
              {[
                { emoji: "🚚", label: "Free returns",   sub: "over CA$75" },
                { emoji: "🛡️", label: "Insured",        sub: "in transit" },
                { emoji: "⚡", label: "Fast dispatch",  sub: `${service.turnaroundDays}-day turnaround` },
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
                {service.category.name}
              </p>
              <h1 className="text-4xl font-heading font-bold text-foreground leading-tight mb-4">
                {service.name}
              </h1>
            </div>

            {/* Price */}
            <div>
              <span className="text-4xl font-heading font-bold text-foreground">
                {formatPrice(service.price)}
              </span>
            </div>

            {/* Description */}
            {(service.longDescription || service.description) && (
              <div>
                <p className="text-muted-foreground leading-relaxed">
                  {service.longDescription ?? service.description}
                </p>
              </div>
            )}

            {/* Add-ons */}
            {service.addons.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-heading font-bold text-foreground mb-4">Available add-ons</h3>
                <ul className="space-y-2.5">
                  {service.addons.map((addon) => (
                    <li key={addon.id} className="flex items-start justify-between gap-4 text-sm">
                      <span className="text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-0.5 shrink-0">+</span>
                        {addon.name}
                        {addon.description && (
                          <span className="text-xs text-muted-foreground/70"> — {addon.description}</span>
                        )}
                      </span>
                      <span className="font-semibold text-foreground shrink-0">
                        +{formatPrice(addon.price)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Estimated turnaround:</span>
                  <span className="font-semibold text-foreground">{service.turnaroundDays} working days</span>
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="space-y-3">
              <AddToCartButton
                product={{
                  id:         service.id,
                  slug:       service.slug,
                  name:       service.name,
                  price:      service.price,
                  emoji:      service.emoji,
                  collection: service.category.name,
                }}
              />
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
              Prices shown include applicable taxes. Free insured returns on orders over CA$75.
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
                  <div className="relative aspect-square bg-gradient-to-br from-primary/10 via-muted to-accent flex items-center justify-center overflow-hidden">
                    {p.imageUrl ? (
                      <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                    ) : (
                      <span className="text-6xl group-hover:scale-110 transition-transform duration-500">
                        {p.emoji}
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{p.category.name}</p>
                    <h3 className="font-heading font-semibold text-foreground mb-2">{p.name}</h3>
                    <p className="text-sm font-bold text-foreground">{formatPrice(p.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

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
