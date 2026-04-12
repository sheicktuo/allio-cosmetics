"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { revalidatePath } from "next/cache"

// ─── Address actions ───────────────────────────────────────────────────────

const addressSchema = z.object({
  label:    z.string().optional(),
  line1:    z.string().min(1, "Address line 1 is required"),
  line2:    z.string().optional(),
  city:     z.string().min(1, "City is required"),
  postcode: z.string().min(1, "Postcode is required"),
  country:  z.string().min(2, "Country is required"),
})

export async function addAddress(formData: FormData) {
  const session = await auth()
  if (!session) return { error: "Not authenticated" }

  const parsed = addressSchema.safeParse({
    label:    formData.get("label")    || undefined,
    line1:    formData.get("line1"),
    line2:    formData.get("line2")    || undefined,
    city:     formData.get("city"),
    postcode: formData.get("postcode"),
    country:  formData.get("country"),
  })
  if (!parsed.success) return { error: parsed.error.errors[0]?.message }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { id: true, _count: { select: { addresses: true } } },
  })
  if (!user) return { error: "User not found" }

  const isFirst = user._count.addresses === 0

  await prisma.address.create({
    data: {
      userId:    user.id,
      label:     parsed.data.label    ?? null,
      line1:     parsed.data.line1,
      line2:     parsed.data.line2    ?? null,
      city:      parsed.data.city,
      postcode:  parsed.data.postcode,
      country:   parsed.data.country,
      isDefault: isFirst, // first address is automatically default
    },
  })

  revalidatePath("/profile/settings")
  return { success: true }
}

export async function updateAddress(formData: FormData) {
  const session = await auth()
  if (!session) return { error: "Not authenticated" }

  const id = formData.get("id") as string
  if (!id) return { error: "Address ID is required" }

  const parsed = addressSchema.safeParse({
    label:    formData.get("label")    || undefined,
    line1:    formData.get("line1"),
    line2:    formData.get("line2")    || undefined,
    city:     formData.get("city"),
    postcode: formData.get("postcode"),
    country:  formData.get("country"),
  })
  if (!parsed.success) return { error: parsed.error.errors[0]?.message }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { id: true },
  })
  if (!user) return { error: "User not found" }

  await prisma.address.updateMany({
    where: { id, userId: user.id },
    data: {
      label:    parsed.data.label    ?? null,
      line1:    parsed.data.line1,
      line2:    parsed.data.line2    ?? null,
      city:     parsed.data.city,
      postcode: parsed.data.postcode,
      country:  parsed.data.country,
    },
  })

  revalidatePath("/profile/settings")
  return { success: true }
}

export async function deleteAddress(addressId: string) {
  const session = await auth()
  if (!session) return { error: "Not authenticated" }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { id: true },
  })
  if (!user) return { error: "User not found" }

  const deleted = await prisma.address.findFirst({
    where: { id: addressId, userId: user.id },
    select: { isDefault: true },
  })
  if (!deleted) return { error: "Address not found" }

  await prisma.address.delete({ where: { id: addressId } })

  // If we deleted the default, promote the most recent remaining address
  if (deleted.isDefault) {
    const next = await prisma.address.findFirst({
      where:   { userId: user.id },
      orderBy: { createdAt: "desc" },
      select:  { id: true },
    })
    if (next) {
      await prisma.address.update({ where: { id: next.id }, data: { isDefault: true } })
    }
  }

  revalidatePath("/profile/settings")
  return { success: true }
}

export async function setDefaultAddress(addressId: string) {
  const session = await auth()
  if (!session) return { error: "Not authenticated" }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { id: true },
  })
  if (!user) return { error: "User not found" }

  await prisma.$transaction([
    prisma.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } }),
    prisma.address.updateMany({ where: { id: addressId, userId: user.id }, data: { isDefault: true } }),
  ])

  revalidatePath("/profile/settings")
  return { success: true }
}

const profileSchema = z.object({
  name:  z.string().min(1, "Name is required"),
  phone: z.string().optional(),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword:     z.string().min(8, "New password must be at least 8 characters"),
})

export async function updateProfile(formData: FormData) {
  const session = await auth()
  if (!session) return { error: "Not authenticated" }

  const parsed = profileSchema.safeParse({
    name:  formData.get("name"),
    phone: formData.get("phone") || undefined,
  })
  if (!parsed.success) return { error: parsed.error.errors[0]?.message }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.name, phone: parsed.data.phone ?? null },
  })

  revalidatePath("/profile")
  revalidatePath("/profile/settings")
  return { success: true }
}

export async function updatePassword(formData: FormData) {
  const session = await auth()
  if (!session) return { error: "Not authenticated" }

  const parsed = passwordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword:     formData.get("newPassword"),
  })
  if (!parsed.success) return { error: parsed.error.errors[0]?.message }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  })

  if (!user?.passwordHash) return { error: "No password set on this account" }

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash)
  if (!valid) return { error: "Current password is incorrect" }

  const same = await bcrypt.compare(parsed.data.newPassword, user.passwordHash)
  if (same) return { error: "New password must be different from your current password" }

  const newHash = await bcrypt.hash(parsed.data.newPassword, 12)
  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash: newHash },
  })

  return { success: true }
}
