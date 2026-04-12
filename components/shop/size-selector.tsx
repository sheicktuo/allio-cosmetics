"use client"

import { useState } from "react"
import { useCart } from "@/store/cart"
import type { ProductSize } from "@/lib/shop"

type Props = {
  product: {
    id:         string
    slug:       string
    name:       string
    price:      number
    emoji:      string
    collection: string
  }
  sizes: ProductSize[]
}

function formatPrice(cents: number) {
  return `CA$${(cents / 100).toFixed(0)}`
}

export default function SizeSelector({ product, sizes }: Props) {
  const { add, items } = useCart()
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(
    sizes.length === 1 ? sizes[0].id : null
  )

  const hasSizes = sizes.length > 0
  const selectedSize = sizes.find((s) => s.id === selectedSizeId) ?? null

  // Cart key: productId-sizeId when sized, productId when not
  const cartId = hasSizes
    ? selectedSizeId ? `${product.id}-${selectedSizeId}` : null
    : product.id

  const inCart = cartId ? items.some((i) => i.id === cartId) : false
  const displayPrice = selectedSize ? selectedSize.price : product.price

  function handleAddToCart() {
    if (!cartId) return
    add({
      id:         cartId,
      productId:  product.id,
      slug:       product.slug,
      name:       product.name,
      price:      displayPrice,
      emoji:      product.emoji,
      collection: product.collection,
      sizeId:     selectedSize?.id,
      sizeLabel:  selectedSize?.label,
    })
  }

  return (
    <div className="space-y-5">
      {/* Dynamic price */}
      <div>
        <span className="text-4xl font-heading font-bold text-foreground">
          {formatPrice(displayPrice)}
        </span>
        {selectedSize && (
          <span className="ml-2 text-sm text-muted-foreground">/ {selectedSize.label}</span>
        )}
      </div>

      {/* Size picker */}
      {hasSizes && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Select Size
          </p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size.id}
                type="button"
                onClick={() => setSelectedSizeId(size.id)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                  selectedSizeId === size.id
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border text-foreground hover:border-primary/50 hover:bg-muted"
                }`}
              >
                <span>{size.label}</span>
                <span className={`ml-2 text-xs font-normal ${selectedSizeId === size.id ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                  {formatPrice(size.price)}
                </span>
              </button>
            ))}
          </div>
          {hasSizes && !selectedSizeId && (
            <p className="text-xs text-destructive mt-2">Please select a size to continue.</p>
          )}
        </div>
      )}

      {/* Add to cart */}
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={hasSizes && !selectedSizeId}
        className={`w-full py-4 rounded-xl font-semibold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
          inCart
            ? "bg-primary/15 text-primary border border-primary/40"
            : "bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20"
        }`}
      >
        {inCart ? "Added to Cart ✓" : "Add to Cart"}
      </button>
    </div>
  )
}
