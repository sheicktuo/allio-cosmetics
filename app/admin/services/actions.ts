"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function toggleServiceActive(formData: FormData) {
  const id    = formData.get("id") as string
  const value = formData.get("value") === "true"
  await prisma.service.update({ where: { id }, data: { isActive: value } })
  revalidatePath("/admin/services")
}

export async function toggleServiceFeatured(formData: FormData) {
  const id    = formData.get("id") as string
  const value = formData.get("value") === "true"
  await prisma.service.update({ where: { id }, data: { isFeatured: value } })
  revalidatePath("/admin/services")
}
