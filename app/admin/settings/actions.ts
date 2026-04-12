"use server"

import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/require-admin"
import { revalidatePath } from "next/cache"

export async function saveSettings(
  _: unknown,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  try {
    await requireAdmin()
    const data = {
      businessName: (formData.get("businessName") as string) || "Allio Cosmetics",
      email:        (formData.get("email") as string) || null,
      phone:        (formData.get("phone") as string) || null,
      address:      (formData.get("address") as string) || null,
      city:         (formData.get("city") as string) || null,
      country:      (formData.get("country") as string) || null,
      currency:     (formData.get("currency") as string) || "CAD",
    }

    const existing = await prisma.businessSettings.findFirst()
    if (existing) {
      await prisma.businessSettings.update({ where: { id: existing.id }, data })
    } else {
      await prisma.businessSettings.create({ data })
    }

    revalidatePath("/admin/settings")
    return { success: true }
  } catch {
    return { error: "Failed to save settings." }
  }
}
