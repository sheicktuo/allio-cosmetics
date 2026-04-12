import { prisma } from "./prisma"

export type ProductSize = {
  id:        string
  label:     string
  price:     number
  isActive:  boolean
  sortOrder: number
}

export type ShopProduct = {
  id:              string
  slug:            string
  name:            string
  description:     string | null
  longDescription: string | null
  imageUrl:        string | null
  price:           number
  isFeatured:      boolean
  emoji:           string
  sizes:           ProductSize[]
  category:        { id: string; name: string; slug: string }
}

export type ShopCategory = {
  id:          string
  name:        string
  slug:        string
  description: string | null
  imageUrl:    string | null
  _count:      { products: number }
}

// ── Emoji fallback by category slug ───────────────────────────────────────────
const EMOJI_MAP: Record<string, string> = {}

export function categoryEmoji(slug: string): string {
  return EMOJI_MAP[slug] ?? "🛍️"
}

// ── Queries ───────────────────────────────────────────────────────────────────

const PRODUCT_INCLUDE = {
  category: true,
  sizes: {
    where:   { isActive: true },
    orderBy: { sortOrder: "asc" as const },
  },
}

export async function getFeaturedProducts(limit = 4): Promise<ShopProduct[]> {
  const rows = await prisma.product.findMany({
    where:   { isActive: true, isFeatured: true },
    include: PRODUCT_INCLUDE,
    orderBy: { sortOrder: "asc" },
    take:    limit,
  })
  return rows.map((p) => ({ ...p, emoji: categoryEmoji(p.category.slug) }))
}

export async function getActiveProducts(categorySlug?: string): Promise<ShopProduct[]> {
  const rows = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    },
    include: PRODUCT_INCLUDE,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  })
  return rows.map((p) => ({ ...p, emoji: categoryEmoji(p.category.slug) }))
}

export async function getProductBySlug(slug: string): Promise<ShopProduct | null> {
  const p = await prisma.product.findUnique({
    where:   { slug },
    include: PRODUCT_INCLUDE,
  })
  if (!p) return null
  return { ...p, emoji: categoryEmoji(p.category.slug) }
}

export async function getActiveCategories(): Promise<ShopCategory[]> {
  return prisma.category.findMany({
    where:   { isActive: true },
    include: { _count: { select: { products: { where: { isActive: true } } } } },
    orderBy: { sortOrder: "asc" },
  })
}

export async function getCategoriesWithProducts() {
  return prisma.category.findMany({
    where:   { isActive: true },
    include: {
      products: {
        where:   { isActive: true },
        orderBy: { sortOrder: "asc" },
        include: {
          sizes: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
        },
      },
    },
    orderBy: { sortOrder: "asc" },
  })
}
