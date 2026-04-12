"use server"

import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/require-admin"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const createSchema = z.object({
  code:          z.string().min(2).toUpperCase(),
  description:   z.string().optional(),
  discountType:  z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.coerce.number().positive(),
  minOrderValue: z.coerce.number().optional(),
  maxUses:       z.coerce.number().int().positive().optional(),
  expiresAt:     z.string().optional(),
})

export async function createPromoCode(
  _: unknown,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  try { await requireAdmin() } catch { return { error: "Unauthorized" } }

  const parsed = createSchema.safeParse({
    code:          formData.get("code"),
    description:   formData.get("description") || undefined,
    discountType:  formData.get("discountType"),
    discountValue: formData.get("discountValue"),
    minOrderValue: formData.get("minOrderValue") || undefined,
    maxUses:       formData.get("maxUses") || undefined,
    expiresAt:     formData.get("expiresAt") || undefined,
  })
  if (!parsed.success) return { error: parsed.error.errors[0]?.message }

  const existing = await prisma.promoCode.findUnique({ where: { code: parsed.data.code } })
  if (existing) return { error: "A promo code with this code already exists." }

  await prisma.promoCode.create({
    data: {
      code:          parsed.data.code,
      description:   parsed.data.description,
      discountType:  parsed.data.discountType,
      discountValue: parsed.data.discountType === "FIXED"
        ? parsed.data.discountValue * 100  // store as cents
        : parsed.data.discountValue,
      minOrderValue: parsed.data.minOrderValue ? parsed.data.minOrderValue * 100 : null,
      maxUses:       parsed.data.maxUses ?? null,
      expiresAt:     parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
    },
  })

  revalidatePath("/admin/promo-codes")
  return { success: true }
}

export async function togglePromoCode(formData: FormData) {
  await requireAdmin()
  const id    = formData.get("id") as string
  const value = formData.get("value") === "true"
  await prisma.promoCode.update({ where: { id }, data: { isActive: value } })
  revalidatePath("/admin/promo-codes")
}

export async function deletePromoCode(formData: FormData) {
  await requireAdmin()
  const id = formData.get("id") as string
  await prisma.promoCode.delete({ where: { id } })
  revalidatePath("/admin/promo-codes")
}
