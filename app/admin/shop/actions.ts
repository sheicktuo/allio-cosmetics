"use server"

import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/require-admin"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const R = "/admin/shop"

// ─── Collections ───────────────────────────────────────────────────────────

const collectionSchema = z.object({
  name:        z.string().min(1, "Name is required"),
  slug:        z.string().min(1).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers and hyphens"),
  description: z.string().optional(),
  imageUrl:    z.string().url().optional().or(z.literal("")),
})

export async function createCollection(
  _: unknown,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  try { await requireAdmin() } catch { return { error: "Unauthorized" } }
  const parsed = collectionSchema.safeParse({
    name:        formData.get("name"),
    slug:        formData.get("slug"),
    description: formData.get("description") || undefined,
    imageUrl:    formData.get("imageUrl") || undefined,
  })
  if (!parsed.success) return { error: parsed.error.errors[0]?.message }

  const exists = await prisma.category.findUnique({ where: { slug: parsed.data.slug } })
  if (exists) return { error: "A collection with this slug already exists." }

  const max = await prisma.category.aggregate({ _max: { sortOrder: true } })
  await prisma.category.create({
    data: {
      ...parsed.data,
      imageUrl:  parsed.data.imageUrl || null,
      sortOrder: (max._max.sortOrder ?? 0) + 1,
    },
  })

  revalidatePath(R)
  return { success: true }
}

export async function updateCollection(
  _: unknown,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  try { await requireAdmin() } catch { return { error: "Unauthorized" } }
  const id     = formData.get("id") as string
  const parsed = collectionSchema.safeParse({
    name:        formData.get("name"),
    slug:        formData.get("slug"),
    description: formData.get("description") || undefined,
    imageUrl:    formData.get("imageUrl") || undefined,
  })
  if (!parsed.success) return { error: parsed.error.errors[0]?.message }

  const conflict = await prisma.category.findFirst({
    where: { slug: parsed.data.slug, NOT: { id } },
  })
  if (conflict) return { error: "Another collection already uses this slug." }

  await prisma.category.update({
    where: { id },
    data: { ...parsed.data, imageUrl: parsed.data.imageUrl || null },
  })
  revalidatePath(R)
  return { success: true }
}

export async function deleteCollection(formData: FormData) {
  await requireAdmin()
  const id = formData.get("id") as string
  await prisma.category.delete({ where: { id } })
  revalidatePath(R)
}

export async function toggleCollectionActive(formData: FormData) {
  await requireAdmin()
  const id    = formData.get("id") as string
  const value = formData.get("value") === "true"
  await prisma.category.update({ where: { id }, data: { isActive: value } })
  revalidatePath(R)
}

// ─── Products ──────────────────────────────────────────────────────────────

const productSchema = z.object({
  name:        z.string().min(1, "Name is required"),
  slug:        z.string().min(1).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers and hyphens"),
  categoryId:  z.string().min(1, "Collection is required"),
  price:       z.coerce.number().min(0, "Price must be 0 or more"),
  description: z.string().optional(),
  imageUrl:    z.string().url().optional().or(z.literal("")),
  isActive:    z.coerce.boolean().optional(),
  isFeatured:  z.coerce.boolean().optional(),
})

type SizeRow = { label: string; price: number; sortOrder: number }

function parseSizes(sizesJson: FormDataEntryValue | null): SizeRow[] {
  if (!sizesJson) return []
  try {
    const rows = JSON.parse(sizesJson as string) as { label: string; price: string | number }[]
    return rows
      .filter((r) => r.label?.trim())
      .map((r, i) => ({
        label:     r.label.trim(),
        price:     Math.round(Number(r.price) * 100),
        sortOrder: i,
      }))
  } catch {
    return []
  }
}

export async function createProduct(
  _: unknown,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  try { await requireAdmin() } catch { return { error: "Unauthorized" } }
  const parsed = productSchema.safeParse({
    name:        formData.get("name"),
    slug:        formData.get("slug"),
    categoryId:  formData.get("categoryId"),
    price:       formData.get("price"),
    description: formData.get("description") || undefined,
    imageUrl:    formData.get("imageUrl") || undefined,
    isActive:    formData.get("isActive") === "true",
    isFeatured:  formData.get("isFeatured") === "true",
  })
  if (!parsed.success) return { error: parsed.error.errors[0]?.message }

  const exists = await prisma.product.findUnique({ where: { slug: parsed.data.slug } })
  if (exists) return { error: "A product with this slug already exists." }

  const sizes = parseSizes(formData.get("sizesJson"))
  const max   = await prisma.product.aggregate({ _max: { sortOrder: true } })

  await prisma.product.create({
    data: {
      ...parsed.data,
      price:     Math.round(parsed.data.price * 100),
      imageUrl:  parsed.data.imageUrl || null,
      sortOrder: (max._max.sortOrder ?? 0) + 1,
      sizes:     sizes.length > 0 ? { create: sizes } : undefined,
    },
  })

  revalidatePath(R)
  return { success: true }
}

export async function updateProduct(
  _: unknown,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  try { await requireAdmin() } catch { return { error: "Unauthorized" } }
  const id     = formData.get("id") as string
  const parsed = productSchema.safeParse({
    name:        formData.get("name"),
    slug:        formData.get("slug"),
    categoryId:  formData.get("categoryId"),
    price:       formData.get("price"),
    description: formData.get("description") || undefined,
    imageUrl:    formData.get("imageUrl") || undefined,
    isActive:    formData.get("isActive") === "true",
    isFeatured:  formData.get("isFeatured") === "true",
  })
  if (!parsed.success) return { error: parsed.error.errors[0]?.message }

  const conflict = await prisma.product.findFirst({
    where: { slug: parsed.data.slug, NOT: { id } },
  })
  if (conflict) return { error: "Another product already uses this slug." }

  const sizes = parseSizes(formData.get("sizesJson"))

  await prisma.$transaction([
    // Replace all sizes
    prisma.productSize.deleteMany({ where: { productId: id } }),
    prisma.product.update({
      where: { id },
      data: {
        ...parsed.data,
        price:    Math.round(parsed.data.price * 100),
        imageUrl: parsed.data.imageUrl || null,
        sizes:    sizes.length > 0 ? { create: sizes } : undefined,
      },
    }),
  ])

  revalidatePath(R)
  return { success: true }
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin()
  const id = formData.get("id") as string
  await prisma.product.delete({ where: { id } })
  revalidatePath(R)
}

export async function toggleProductActive(formData: FormData) {
  await requireAdmin()
  const id    = formData.get("id") as string
  const value = formData.get("value") === "true"
  await prisma.product.update({ where: { id }, data: { isActive: value } })
  revalidatePath(R)
}

export async function toggleProductFeatured(formData: FormData) {
  await requireAdmin()
  const id    = formData.get("id") as string
  const value = formData.get("value") === "true"
  await prisma.product.update({ where: { id }, data: { isFeatured: value } })
  revalidatePath(R)
}
