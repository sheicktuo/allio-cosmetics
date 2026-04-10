"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Header from "@/components/layout/header"
import { Badge } from "@/components/ui/badge"
import { products } from "@/lib/products"
import { useCart } from "@/store/cart"

const filters = ["All", "Reconditioning", "Scent Refresh", "Bottle Care", "Bespoke"]
const sortOptions = [
  { value: "featured", label: "Sort: Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
]

function formatPrice(pence: number) {
  return `£${(pence / 100).toFixed(0)}`
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-xs text-primary font-medium">
      {"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))} {rating.toFixed(1)}
    </span>
  )
}

function ShopContent() {
  const searchParams = useSearchParams()
  const activeFilter = searchParams.get("filter") ?? "All"
  const sort = searchParams.get("sort") ?? "featured"
  const { add, items } = useCart()

  const filtered =
    activeFilter === "All" ? products : products.filter((p) => p.collection === activeFilter)

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price
    if (sort === "price-desc") return b.price - a.price
    if (sort === "rating") return b.rating - a.rating
    return 0
  })

  function buildHref(newFilter?: string, newSort?: string) {
    const params = new URLSearchParams()
    const f = newFilter ?? activeFilter
    const s = newSort ?? sort
    if (f !== "All") params.set("filter", f)
    if (s !== "featured") params.set("sort", s)
    return `/shop${params.toString() ? `?${params}` : ""}`
  }

  return (
    <>
      {/* Filters + Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <Link
              key={f}
              href={buildHref(f, sort)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                activeFilter === f
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {f}
            </Link>
          ))}
        </div>

        <select
          value={sort}
          onChange={(e) => {
            window.location.href = buildHref(activeFilter, e.target.value)
          }}
          className="text-sm border border-border rounded-lg px-3 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
        >
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Count */}
      <p className="text-sm text-muted-foreground mb-6">
        {sorted.length} product{sorted.length !== 1 ? "s" : ""}
        {activeFilter !== "All" ? ` in ${activeFilter}` : ""}
      </p>

      {/* Product grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {sorted.map((product) => {
          const inCart = items.some((i) => i.id === product.id)
          return (
            <div
              key={product.id}
              className="group border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 bg-card hover:border-primary/30 flex flex-col"
            >
              <Link href={`/shop/product/${product.slug}`} className="flex-1">
                <div className="relative aspect-square bg-gradient-to-br from-primary/10 via-muted to-accent flex items-center justify-center overflow-hidden">
                  <span className="text-7xl group-hover:scale-110 transition-transform duration-500">
                    {product.emoji}
                  </span>
                  {product.badge && (
                    <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground border-0 text-xs">
                      {product.badge}
                    </Badge>
                  )}
                  {product.originalPrice && (
                    <Badge className="absolute top-3 right-3 bg-destructive text-white border-0 text-xs">
                      Sale
                    </Badge>
                  )}
                </div>

                <div className="p-5 pb-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">
                    {product.brand} · {product.collection}
                  </p>
                  <h3 className="font-heading font-semibold text-foreground leading-snug mb-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center gap-1 mb-3">
                    <StarRating rating={product.rating} />
                    <span className="text-xs text-muted-foreground">({product.reviews})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-foreground">{formatPrice(product.price)}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>

              <div className="px-5 pb-5">
                <button
                  onClick={() =>
                    add({
                      id: product.id,
                      slug: product.slug,
                      name: product.name,
                      price: product.price,
                      emoji: product.emoji,
                      collection: product.collection,
                    })
                  }
                  className={`w-full mt-2 text-sm font-semibold py-2.5 rounded-xl transition-all ${
                    inCart
                      ? "bg-primary/15 text-primary border border-primary/30"
                      : "bg-primary text-primary-foreground hover:opacity-90"
                  }`}
                >
                  {inCart ? "Added to Cart ✓" : "Add to Cart"}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {sorted.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-lg font-heading font-semibold text-foreground mb-1">No products found</p>
          <p>Try a different filter.</p>
        </div>
      )}
    </>
  )
}

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-1">Shop</h1>
          <p className="text-muted-foreground">Our full range of reconditioning services</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Suspense fallback={<div className="text-muted-foreground">Loading...</div>}>
          <ShopContent />
        </Suspense>
      </div>
    </div>
  )
}
