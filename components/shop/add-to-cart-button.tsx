"use client"

import { useCart } from "@/store/cart"

type Props = {
  product: {
    id:         string
    slug:       string
    name:       string
    price:      number
    emoji:      string
    collection: string
  }
}

export default function AddToCartButton({ product }: Props) {
  const { add, items } = useCart()
  const inCart = items.some((i) => i.id === product.id)

  return (
    <button
      onClick={() => add(product)}
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
