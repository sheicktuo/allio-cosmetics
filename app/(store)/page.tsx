import Link from "next/link"
import Image from "next/image"
import Header from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getFeaturedServices, getActiveCategories, categoryEmoji } from "@/lib/shop"

function formatPrice(cents: number) {
  return `CA$${(cents / 100).toFixed(0)}`
}

// Bento grid styles cycle for up to 4 collections
const BENTO_SIZE = ["col-span-2 row-span-2", "col-span-1 row-span-1", "col-span-1 row-span-1", "col-span-2 row-span-1"]
const BENTO_BG   = ["bg-primary", "bg-secondary dark:bg-card", "bg-muted dark:bg-card", "bg-primary/80"]
const BENTO_TEXT = ["text-primary-foreground", "text-secondary-foreground", "text-foreground", "text-primary-foreground"]

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function Home() {
  const [featuredServices, categories] = await Promise.all([
    getFeaturedServices(4),
    getActiveCategories(),
  ])

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-linear-to-br from-background via-muted to-accent overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary rounded-full opacity-10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-primary rounded-full opacity-10 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <div className="space-y-7">
              <span className="inline-block bg-primary/15 text-primary px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide border border-primary/20">
                New Collection — Spring 2026
              </span>
              <h1 className="text-5xl md:text-6xl font-heading font-bold text-foreground leading-[1.1]">
                Restore the<br />
                <span className="text-primary">Scent You Love</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
                Shop our premium reconditioning products and services. Bring your designer fragrances back to life — effortlessly.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-primary hover:opacity-90 text-primary-foreground shadow-lg shadow-primary/20">
                  <Link href="/shop">Shop Now</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/shop/collections">View Collections</Link>
                </Button>
              </div>
              <div className="flex items-center gap-10 pt-1">
                <div>
                  <p className="text-2xl font-bold font-heading text-foreground">500+</p>
                  <p className="text-sm text-muted-foreground">Bottles Restored</p>
                </div>
                <div>
                  <p className="text-2xl font-bold font-heading text-foreground">4.9★</p>
                  <p className="text-sm text-muted-foreground">Rating</p>
                </div>
                <div>
                  <p className="text-2xl font-bold font-heading text-foreground">Free</p>
                  <p className="text-sm text-muted-foreground">Returns over CA$75</p>
                </div>
              </div>
            </div>

            {/* Product preview — top 2 featured or generic fallback */}
            <div className="relative hidden md:flex gap-4 justify-center">
              {featuredServices[0] ? (
                <Link
                  href={`/shop/product/${featuredServices[0].slug}`}
                  className="bg-card border border-border rounded-3xl shadow-2xl p-8 w-56 text-center hover:shadow-primary/10 transition-shadow"
                >
                  <div className="relative w-full aspect-square bg-linear-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mb-4 overflow-hidden">
                    {featuredServices[0].imageUrl ? (
                      <Image src={featuredServices[0].imageUrl} alt={featuredServices[0].name} fill className="object-cover" />
                    ) : (
                      <span className="text-6xl">{featuredServices[0].emoji}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Featured</p>
                  <p className="font-bold font-heading text-foreground mt-0.5 text-sm leading-snug">{featuredServices[0].name}</p>
                  <p className="text-primary font-semibold mt-1">{formatPrice(featuredServices[0].price)}</p>
                </Link>
              ) : (
                <div className="bg-card border border-border rounded-3xl shadow-2xl p-8 w-56 text-center">
                  <div className="w-full aspect-square bg-linear-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mb-4">
                    <span className="text-6xl">🌹</span>
                  </div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Best Seller</p>
                  <p className="font-bold font-heading text-foreground mt-0.5">Full Reconditioning</p>
                  <p className="text-primary font-semibold mt-1">CA$49</p>
                </div>
              )}
              {featuredServices[1] && (
                <Link
                  href={`/shop/product/${featuredServices[1].slug}`}
                  className="bg-card border border-border rounded-3xl shadow-xl p-8 w-48 text-center self-end mb-8 hover:shadow-primary/10 transition-shadow"
                >
                  <div className="relative w-full aspect-square bg-linear-to-br from-primary/15 to-primary/5 rounded-2xl flex items-center justify-center mb-4 overflow-hidden">
                    {featuredServices[1].imageUrl ? (
                      <Image src={featuredServices[1].imageUrl} alt={featuredServices[1].name} fill className="object-cover" />
                    ) : (
                      <span className="text-5xl">{featuredServices[1].emoji}</span>
                    )}
                  </div>
                  <p className="font-bold font-heading text-foreground text-sm leading-snug">{featuredServices[1].name}</p>
                  <p className="text-primary font-semibold mt-1 text-sm">{formatPrice(featuredServices[1].price)}</p>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Products ────────────────────────────────────────────── */}
      {featuredServices.length > 0 && (
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl font-heading font-bold text-foreground">Featured Products</h2>
                <p className="text-muted-foreground mt-1">Our most-loved reconditioning packages</p>
              </div>
              <Link href="/shop" className="text-sm font-medium text-primary hover:underline hidden sm:block">
                View all →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredServices.map((svc) => (
                <Link
                  key={svc.id}
                  href={`/shop/product/${svc.slug}`}
                  className="group border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow bg-card"
                >
                  {/* Image area */}
                  <div className="relative bg-linear-to-br from-primary/10 via-muted to-accent aspect-square flex items-center justify-center overflow-hidden">
                    {svc.imageUrl ? (
                      <Image src={svc.imageUrl} alt={svc.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <span className="text-7xl group-hover:scale-110 transition-transform duration-300">
                        {svc.emoji}
                      </span>
                    )}
                    <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground border-0">
                      Featured
                    </Badge>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
                      {svc.category.name}
                    </p>
                    <h3 className="font-semibold font-heading text-foreground mb-3 leading-snug">{svc.name}</h3>
                    <span className="text-lg font-bold text-foreground">{formatPrice(svc.price)}</span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-8 sm:hidden">
              <Button asChild variant="outline">
                <Link href="/shop">View All Products</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ── Collection View ──────────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="py-20 bg-muted/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl font-heading font-bold text-foreground">Shop by Collection</h2>
                <p className="text-muted-foreground mt-1">Find exactly what your fragrance needs</p>
              </div>
              <Link href="/shop/collections" className="text-sm font-medium text-primary hover:underline hidden sm:block">
                All collections →
              </Link>
            </div>

            {/* Bento grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[180px]">
              {categories.slice(0, 4).map((cat, i) => {
                const emoji = categoryEmoji(cat.slug)
                return (
                  <Link
                    key={cat.slug}
                    href={`/shop?filter=${encodeURIComponent(cat.name)}`}
                    className={`${BENTO_SIZE[i]} ${BENTO_BG[i]} rounded-2xl p-6 flex flex-col justify-end group overflow-hidden relative hover:opacity-95 transition-opacity border border-border`}
                  >
                    {cat.imageUrl ? (
                      <Image
                        src={cat.imageUrl}
                        alt={cat.name}
                        fill
                        className="object-cover opacity-30 group-hover:opacity-40 transition-opacity"
                      />
                    ) : (
                      <div className="absolute top-5 right-5 text-4xl opacity-25 group-hover:opacity-45 transition-opacity">
                        {emoji}
                      </div>
                    )}
                    <div className="relative">
                      {cat.description && (
                        <p className={`text-xs font-medium uppercase tracking-wider opacity-70 mb-1 ${BENTO_TEXT[i]}`}>
                          {cat.description}
                        </p>
                      )}
                      <h3 className={`text-xl font-bold font-heading ${BENTO_TEXT[i]}`}>{cat.name}</h3>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="bg-foreground text-background py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-bold font-heading">A</span>
                </div>
                <span className="text-xl font-bold font-heading">Allio <span className="text-primary">Cosmetics</span></span>
              </div>
              <p className="opacity-60 text-sm leading-relaxed">
                Specialist designer perfume reconditioning. Restore what you love.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-sm uppercase tracking-wide font-heading text-primary">Shop</h3>
              <ul className="space-y-2 opacity-60 text-sm">
                <li><Link href="/shop" className="hover:opacity-100 transition-opacity">All Products</Link></li>
                <li><Link href="/shop/collections" className="hover:opacity-100 transition-opacity">Collections</Link></li>
                <li><Link href="/services" className="hover:opacity-100 transition-opacity">Services</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-sm uppercase tracking-wide font-heading text-primary">Company</h3>
              <ul className="space-y-2 opacity-60 text-sm">
                <li><Link href="/about" className="hover:opacity-100 transition-opacity">About Us</Link></li>
                <li><Link href="/track" className="hover:opacity-100 transition-opacity">Track Order</Link></li>
                <li><Link href="/contact" className="hover:opacity-100 transition-opacity">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-sm uppercase tracking-wide font-heading text-primary">Account</h3>
              <ul className="space-y-2 opacity-60 text-sm">
                <li><Link href="/login" className="hover:opacity-100 transition-opacity">Login</Link></li>
                <li><Link href="/register" className="hover:opacity-100 transition-opacity">Create Account</Link></li>
                <li><Link href="/profile/orders" className="hover:opacity-100 transition-opacity">My Orders</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-background/10 pt-8 flex flex-col md:flex-row justify-between items-center opacity-50 text-sm gap-4">
            <p>&copy; 2026 Allio Cosmetics. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:opacity-100 transition-opacity">Privacy Policy</Link>
              <Link href="/terms" className="hover:opacity-100 transition-opacity">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
