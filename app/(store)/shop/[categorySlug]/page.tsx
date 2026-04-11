import { redirect, notFound } from "next/navigation"
import { getActiveCategories } from "@/lib/shop"

type Props = { params: Promise<{ categorySlug: string }> }

// Redirect /shop/[categorySlug] → /shop?filter=CategoryName
export default async function ShopCategoryPage({ params }: Props) {
  const { categorySlug } = await params

  const categories = await getActiveCategories()
  const match = categories.find((c) => c.slug === categorySlug)

  if (!match) notFound()

  redirect(`/shop?filter=${encodeURIComponent(match.name)}`)
}
