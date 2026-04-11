import { prisma } from "./prisma"

// ── Emoji fallback by category slug ───────────────────────────────────────────
const EMOJI_MAP: Record<string, string> = {
  reconditioning:  "✨",
  "scent-refresh": "🌸",
  "bottle-care":   "💎",
  bespoke:         "🧪",
  restoration:     "💎",
}

export function categoryEmoji(slug: string): string {
  return EMOJI_MAP[slug] ?? "🌹"
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type ShopService = {
  id:              string
  slug:            string
  name:            string
  description:     string | null
  longDescription: string | null
  imageUrl:        string | null
  price:           number
  turnaroundDays:  number
  isFeatured:      boolean
  emoji:           string
  category:        { id: string; name: string; slug: string }
  addons:          { id: string; name: string; description: string | null; price: number }[]
}

export type ShopCategory = {
  id:          string
  name:        string
  slug:        string
  description: string | null
  imageUrl:    string | null
  _count:      { services: number }
}

// ── Queries ───────────────────────────────────────────────────────────────────

export async function getFeaturedServices(limit = 4): Promise<ShopService[]> {
  const rows = await prisma.service.findMany({
    where:   { isActive: true, isFeatured: true },
    include: { category: true, addons: { where: { isActive: true }, orderBy: { sortOrder: "asc" } } },
    orderBy: { sortOrder: "asc" },
    take:    limit,
  })
  return rows.map((s) => ({ ...s, emoji: categoryEmoji(s.category.slug) }))
}

export async function getActiveServices(categorySlug?: string): Promise<ShopService[]> {
  const rows = await prisma.service.findMany({
    where: {
      isActive: true,
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    },
    include: { category: true, addons: { where: { isActive: true }, orderBy: { sortOrder: "asc" } } },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  })
  return rows.map((s) => ({ ...s, emoji: categoryEmoji(s.category.slug) }))
}

export async function getServiceBySlug(slug: string): Promise<ShopService | null> {
  const s = await prisma.service.findUnique({
    where:   { slug },
    include: { category: true, addons: { where: { isActive: true }, orderBy: { sortOrder: "asc" } } },
  })
  if (!s) return null
  return { ...s, emoji: categoryEmoji(s.category.slug) }
}

export async function getActiveCategories(): Promise<ShopCategory[]> {
  return prisma.serviceCategory.findMany({
    where:   { isActive: true },
    include: { _count: { select: { services: { where: { isActive: true } } } } },
    orderBy: { sortOrder: "asc" },
  })
}

export async function getCategoriesWithServices() {
  return prisma.serviceCategory.findMany({
    where:   { isActive: true },
    include: {
      services: {
        where:   { isActive: true },
        include: { addons: { where: { isActive: true }, orderBy: { sortOrder: "asc" } } },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  })
}
