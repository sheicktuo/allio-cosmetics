import { Suspense } from "react"
import Header from "@/components/layout/header"
import ShopContent from "./shop-content"
import { getActiveProducts } from "@/lib/shop"

export const metadata = { title: "Shop — Allio Cosmetics" }

export default async function ShopPage() {
  const products = await getActiveProducts()

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-1">Shop</h1>
          <p className="text-muted-foreground">Explore our full range of products</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Suspense fallback={<div className="text-muted-foreground">Loading...</div>}>
          <ShopContent products={products} />
        </Suspense>
      </div>
    </div>
  )
}
