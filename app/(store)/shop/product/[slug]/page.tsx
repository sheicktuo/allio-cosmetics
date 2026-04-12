import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import SizeSelector from "@/components/shop/size-selector"
import { Badge } from "@/components/ui/badge"
import { getProductBySlug, getActiveProducts } from "@/lib/shop"

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const products = await getActiveProducts()
  return products.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return {}
  return {
    title:       `${product.name} — Allio Cosmetics`,
    description: product.description ?? undefined,
  }
}

function formatPrice(cents: number) {
  return `CA$${(cents / 100).toFixed(0)}`
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const allProducts = await getActiveProducts()
  const related = allProducts
    .filter((p) => p.id !== product.id && p.category.id === product.category.id)
    .slice(0, 3)
    .concat(
      allProducts
        .filter((p) => p.id !== product.id && p.category.id !== product.category.id)
        .slice(0, Math.max(0, 3 - allProducts.filter((p) => p.id !== product.id && p.category.id === product.category.id).length))
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
              href={`/shop?filter=${encodeURIComponent(product.category.name)}`}
              className="hover:text-foreground transition-colors"
            >
              {product.category.name}
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
              {product.imageUrl ? (
                <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
              ) : (
                <span className="text-[10rem]">{product.emoji}</span>
              )}
              {product.isFeatured && (
                <Badge className="absolute top-5 left-5 bg-primary text-primary-foreground border-0 text-sm px-3 py-1">
                  Featured
                </Badge>
              )}
            </div>

            {/* Trust signals */}
            <div className="grid grid-cols-3 gap-3 mt-5">
              {[
                { emoji: "🚚", label: "Free shipping", sub: "on orders over CA$75" },
                { emoji: "🔄", label: "Easy returns",  sub: "within 30 days" },
                { emoji: "✅", label: "Quality assured", sub: "every product" },
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
                {product.category.name}
              </p>
              <h1 className="text-4xl font-heading font-bold text-foreground leading-tight mb-4">
                {product.name}
              </h1>
            </div>

            {/* Description */}
            {(product.longDescription || product.description) && (
              <div>
                <p className="text-muted-foreground leading-relaxed">
                  {product.longDescription ?? product.description}
                </p>
              </div>
            )}

            {/* Size selector + price + CTA */}
            <SizeSelector
              product={{
                id:         product.id,
                slug:       product.slug,
                name:       product.name,
                price:      product.price,
                emoji:      product.emoji,
                collection: product.category.name,
              }}
              sizes={product.sizes}
            />

            {/* Fine print */}
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              By adding to cart you agree to our{" "}
              <Link href="/terms" className="underline hover:text-foreground">Terms of Service</Link>.
              Prices shown include applicable taxes. Free shipping on orders over CA$75.
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

      <Footer />
    </div>
  )
}
