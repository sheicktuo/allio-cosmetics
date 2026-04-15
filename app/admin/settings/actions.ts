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
    // Parse fee/tax inputs (admin enters dollars + percentages; store in cents/decimals)
    const deliveryFeeInput           = parseFloat((formData.get("deliveryFee")           as string) || "0")
    const freeDeliveryThresholdInput = parseFloat((formData.get("freeDeliveryThreshold") as string) || "0")
    const taxRateInput               = parseFloat((formData.get("taxRate")               as string) || "0")

    const data = {
      businessName:           (formData.get("businessName") as string) || "Allio Cosmetics",
      email:                  (formData.get("email")        as string) || null,
      phone:                  (formData.get("phone")        as string) || null,
      address:                (formData.get("address")      as string) || null,
      city:                   (formData.get("city")         as string) || null,
      postcode:               (formData.get("postcode")     as string) || null,
      country:                (formData.get("country")      as string) || null,
      currency:               (formData.get("currency")     as string) || "CAD",
      taxLabel:               (formData.get("taxLabel")     as string) || "Tax",
      deliveryFee:           Math.round(deliveryFeeInput           * 100),  // dollars → cents
      freeDeliveryThreshold: Math.round(freeDeliveryThresholdInput * 100),  // dollars → cents
      taxRate:               taxRateInput / 100,                             // percent → decimal
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
