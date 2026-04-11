"use client"

import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/store/cart"
import type { ShopService } from "@/lib/shop"

const sortOptions = [
  { value: "featured", label: "Sort: Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
]

function formatPrice(cents: number) {
  return `CA$${(cents / 100).toFixed(0)}`
}

type Props = { services: ShopService[] }

export default function ShopContent({ services }: Props) {
  const searchParams  = useSearchParams()
  const activeFilter  = searchParams.get("filter") ?? "All"
  const sort          = searchParams.get("sort")   ?? "featured"
  const { add, items } = useCart()

  // Derive collection list from live data
  const collections = ["All", ...Array.from(new Set(services.map((s) => s.category.name)))]

  const filtered =
    activeFilter === "All" ? services : services.filter((s) => s.category.name === activeFilter)

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "price-asc")  return a.price - b.price
    if (sort === "price-desc") return b.price - a.price
    // "featured": featured first, then by sortOrder
    if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1
    return 0
  })

  function buildHref(newFilter?: string, newSort?: string) {
    const params = new URLSearchParams()
    const f = newFilter ?? activeFilter
    const s = newSort   ?? sort
    if (f !== "All")       params.set("filter", f)
    if (s !== "featured")  params.set("sort", s)
    return `/shop${params.toString() ? `?${params}` : ""}`
  }

  return (
    <>
      {/* Filters + Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div className="flex flex-wrap gap-2">
          {collections.map((f) => (
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
          onChange={(e) => { window.location.href = buildHref(activeFilter, e.target.value) }}
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
        {sorted.map((svc) => {
          const inCart = items.some((i) => i.id === svc.id)
          return (
            <div
              key={svc.id}
              className="group border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 bg-card hover:border-primary/30 flex flex-col"
            >
              <Link href={`/shop/product/${svc.slug}`} className="flex-1">
                <div className="relative aspect-square bg-gradient-to-br from-primary/10 via-muted to-accent flex items-center justify-center overflow-hidden">
                  {svc.imageUrl ? (
                    <Image src={svc.imageUrl} alt={svc.name} fill className="object-cover" />
                  ) : (
                    <span className="text-7xl group-hover:scale-110 transition-transform duration-500">
                      {svc.emoji}
                    </span>
                  )}
                  {svc.isFeatured && (
                    <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground border-0 text-xs">
                      Featured
                    </Badge>
                  )}
                </div>

                <div className="p-5 pb-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">
                    {svc.category.name}
                  </p>
                  <h3 className="font-heading font-semibold text-foreground leading-snug mb-1">
                    {svc.name}
                  </h3>
                  {svc.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">
                      {svc.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-foreground">{formatPrice(svc.price)}</span>
                    <span className="text-xs text-muted-foreground">{svc.turnaroundDays}-day turnaround</span>
                  </div>
                </div>
              </Link>

              <div className="px-5 pb-5">
                <button
                  onClick={() =>
                    add({
                      id:         svc.id,
                      slug:       svc.slug,
                      name:       svc.name,
                      price:      svc.price,
                      emoji:      svc.emoji,
                      collection: svc.category.name,
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
