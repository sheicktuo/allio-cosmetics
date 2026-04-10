"use client"

import { useCart } from "@/store/cart"
import type { Product } from "@/lib/products"

export default function AddToCartButton({ product }: { product: Product }) {
  const { add, items } = useCart()
  const inCart = items.some((i) => i.id === product.id)

  return (
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
      className={`w-full py-4 rounded-xl font-semibold text-base transition-all ${
        inCart
          ? "bg-primary/15 text-primary border border-primary/40"
          : "bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20"
      }`}
    >
      {inCart ? "Added to Cart ✓" : "Add to Cart"}
    </button>
  )
}
