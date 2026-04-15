"use server"

import { prisma }         from "@/lib/prisma"
import { auth }           from "@/auth"
import { revalidatePath } from "next/cache"
import { RequestStatus }  from "@prisma/client"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || !["ADMIN", "SUPERADMIN"].includes(session.user.role)) {
    throw new Error("Unauthorized")
  }
}

export async function updateRequestStatus(
  id:     string,
  status: RequestStatus,
): Promise<{ success: boolean }> {
  try {
    await requireAdmin()
    await prisma.customRequest.update({ where: { id }, data: { status } })
    revalidatePath(`/admin/requests/${id}`)
    revalidatePath("/admin/requests")
    return { success: true }
  } catch {
    return { success: false }
  }
}

export async function updateAdminNotes(
  id:         string,
  adminNotes: string,
): Promise<{ success: boolean }> {
  try {
    await requireAdmin()
    await prisma.customRequest.update({ where: { id }, data: { adminNotes } })
    revalidatePath(`/admin/requests/${id}`)
    return { success: true }
  } catch {
    return { success: false }
  }
}
