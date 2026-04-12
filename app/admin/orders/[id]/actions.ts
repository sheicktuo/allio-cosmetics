"use server"

import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/require-admin"
import { revalidatePath } from "next/cache"

const STATUS_FLOW = [
  "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED",
] as const

type OrderStatus = (typeof STATUS_FLOW)[number]

export async function advanceOrderStatus(orderId: string) {
  const session = await requireAdmin()

  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) return { error: "Order not found" }

  const idx = STATUS_FLOW.indexOf(order.status as OrderStatus)
  if (idx === -1 || idx >= STATUS_FLOW.length - 1) return { error: "Cannot advance further" }

  const next = STATUS_FLOW[idx + 1]
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: next,
      statusHistory: { create: { status: next, changedBy: session.user.id } },
    },
  })

  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath("/admin/orders")
  return { success: true, status: next }
}

export async function setOrderStatus(orderId: string, status: string, note?: string) {
  const session = await requireAdmin()

  const allStatuses = [...STATUS_FLOW, "CANCELLED", "REFUNDED"]
  if (!allStatuses.includes(status as OrderStatus)) return { error: "Invalid status" }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: status as never,
      statusHistory: { create: { status: status as never, note: note ?? null, changedBy: session.user.id } },
    },
  })

  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath("/admin/orders")
  return { success: true }
}

export async function saveOrderNotes(_prev: { success: boolean; error?: string } | undefined, fd: FormData) {
  await requireAdmin()

  const orderId  = fd.get("orderId") as string
  const staffNotes = (fd.get("staffNotes") as string) || null

  await prisma.order.update({
    where: { id: orderId },
    data:  { staffNotes },
  })

  revalidatePath(`/admin/orders/${orderId}`)
  return { success: true }
}
