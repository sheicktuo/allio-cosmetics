"use server"

import { prisma } from "@/lib/prisma"
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
  const parsed = collectionSchema.safeParse({
    name:        formData.get("name"),
    slug:        formData.get("slug"),
    description: formData.get("description") || undefined,
    imageUrl:    formData.get("imageUrl") || undefined,
  })
  if (!parsed.success) return { error: parsed.error.errors[0]?.message }

  const exists = await prisma.serviceCategory.findUnique({ where: { slug: parsed.data.slug } })
  if (exists) return { error: "A collection with this slug already exists." }

  const max = await prisma.serviceCategory.aggregate({ _max: { sortOrder: true } })
  await prisma.serviceCategory.create({
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
  const id     = formData.get("id") as string
  const parsed = collectionSchema.safeParse({
    name:        formData.get("name"),
    slug:        formData.get("slug"),
    description: formData.get("description") || undefined,
    imageUrl:    formData.get("imageUrl") || undefined,
  })
  if (!parsed.success) return { error: parsed.error.errors[0]?.message }

  const conflict = await prisma.serviceCategory.findFirst({
    where: { slug: parsed.data.slug, NOT: { id } },
  })
  if (conflict) return { error: "Another collection already uses this slug." }

  await prisma.serviceCategory.update({
    where: { id },
    data: { ...parsed.data, imageUrl: parsed.data.imageUrl || null },
  })
  revalidatePath(R)
  return { success: true }
}

export async function deleteCollection(formData: FormData) {
  const id = formData.get("id") as string
  await prisma.serviceCategory.delete({ where: { id } })
  revalidatePath(R)
}

export async function toggleCollectionActive(formData: FormData) {
  const id    = formData.get("id") as string
  const value = formData.get("value") === "true"
  await prisma.serviceCategory.update({ where: { id }, data: { isActive: value } })
  revalidatePath(R)
}

// ─── Services / Products ───────────────────────────────────────────────────

const serviceSchema = z.object({
  name:           z.string().min(1, "Name is required"),
  slug:           z.string().min(1).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers and hyphens"),
  categoryId:     z.string().min(1, "Collection is required"),
  price:          z.coerce.number().positive("Price must be positive"),
  turnaroundDays: z.coerce.number().int().positive("Turnaround must be a positive number"),
  description:    z.string().optional(),
  imageUrl:       z.string().url().optional().or(z.literal("")),
  isActive:       z.coerce.boolean().optional(),
  isFeatured:     z.coerce.boolean().optional(),
})

export async function createService(
  _: unknown,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const parsed = serviceSchema.safeParse({
    name:           formData.get("name"),
    slug:           formData.get("slug"),
    categoryId:     formData.get("categoryId"),
    price:          formData.get("price"),
    turnaroundDays: formData.get("turnaroundDays"),
    description:    formData.get("description") || undefined,
    imageUrl:       formData.get("imageUrl") || undefined,
    isActive:       formData.get("isActive") === "true",
    isFeatured:     formData.get("isFeatured") === "true",
  })
  if (!parsed.success) return { error: parsed.error.errors[0]?.message }

  const exists = await prisma.service.findUnique({ where: { slug: parsed.data.slug } })
  if (exists) return { error: "A product with this slug already exists." }

  const max = await prisma.service.aggregate({ _max: { sortOrder: true } })
  await prisma.service.create({
    data: {
      ...parsed.data,
      price:    Math.round(parsed.data.price * 100),
      imageUrl: parsed.data.imageUrl || null,
      sortOrder: (max._max.sortOrder ?? 0) + 1,
    },
  })

  revalidatePath(R)
  return { success: true }
}

export async function updateService(
  _: unknown,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const id     = formData.get("id") as string
  const parsed = serviceSchema.safeParse({
    name:           formData.get("name"),
    slug:           formData.get("slug"),
    categoryId:     formData.get("categoryId"),
    price:          formData.get("price"),
    turnaroundDays: formData.get("turnaroundDays"),
    description:    formData.get("description") || undefined,
    imageUrl:       formData.get("imageUrl") || undefined,
    isActive:       formData.get("isActive") === "true",
    isFeatured:     formData.get("isFeatured") === "true",
  })
  if (!parsed.success) return { error: parsed.error.errors[0]?.message }

  const conflict = await prisma.service.findFirst({
    where: { slug: parsed.data.slug, NOT: { id } },
  })
  if (conflict) return { error: "Another product already uses this slug." }

  await prisma.service.update({
    where: { id },
    data: {
      ...parsed.data,
      price:    Math.round(parsed.data.price * 100),
      imageUrl: parsed.data.imageUrl || null,
    },
  })

  revalidatePath(R)
  return { success: true }
}

export async function deleteService(formData: FormData) {
  const id = formData.get("id") as string
  await prisma.service.delete({ where: { id } })
  revalidatePath(R)
}

export async function toggleServiceActive(formData: FormData) {
  const id    = formData.get("id") as string
  const value = formData.get("value") === "true"
  await prisma.service.update({ where: { id }, data: { isActive: value } })
  revalidatePath(R)
}

export async function toggleServiceFeatured(formData: FormData) {
  const id    = formData.get("id") as string
  const value = formData.get("value") === "true"
  await prisma.service.update({ where: { id }, data: { isFeatured: value } })
  revalidatePath(R)
}
