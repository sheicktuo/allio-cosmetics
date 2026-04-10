"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { revalidatePath } from "next/cache"

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

  const newHash = await bcrypt.hash(parsed.data.newPassword, 12)
  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash: newHash },
  })

  return { success: true }
}
