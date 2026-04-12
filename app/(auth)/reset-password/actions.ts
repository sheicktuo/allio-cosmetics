"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function resetPasswordAction(
  _: unknown,
  formData: FormData,
): Promise<{ success: true } | { error: string }> {
  const token    = (formData.get("token") as string).trim()
  const password = formData.get("password") as string
  const confirm  = formData.get("confirm") as string

  if (!token)                         return { error: "Invalid reset link." }
  if (!password || password.length < 8) return { error: "Password must be at least 8 characters." }
  if (password !== confirm)           return { error: "Passwords do not match." }

  const record = await prisma.passwordResetToken.findUnique({
    where:   { token },
    include: { user: { select: { id: true } } },
  })

  if (!record)              return { error: "Invalid or expired reset link." }
  if (record.used)          return { error: "This reset link has already been used." }
  if (record.expires < new Date()) return { error: "This reset link has expired. Please request a new one." }

  const passwordHash = await bcrypt.hash(password, 12)

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data:  { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data:  { used: true },
    }),
  ])

  return { success: true }
}
