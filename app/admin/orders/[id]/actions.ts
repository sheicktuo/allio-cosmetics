"use server"

import { prisma }         from "@/lib/prisma"
import { resend }         from "@/lib/resend"
import { requireAdmin }   from "@/lib/require-admin"
import { revalidatePath } from "next/cache"

const STATUS_FLOW = [
  "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED",
] as const

type OrderStatus = (typeof STATUS_FLOW)[number]

// ─── Email helper ─────────────────────────────────────────────────────────────

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;")
}

async function sendShippingNotification(orderId: string) {
  try {
    const [order, settings] = await Promise.all([
      prisma.order.findUnique({
        where:   { id: orderId },
        select: {
          orderNumber: true, guestEmail: true, guestName: true,
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.businessSettings.findFirst({ select: { businessName: true } }),
    ])

    if (!order) return

    const toEmail      = order.user?.email ?? order.guestEmail
    const toName       = order.user?.name  ?? order.guestName ?? "Customer"
    const firstName    = toName.split(" ")[0]
    const businessName = settings?.businessName ?? "Allio Cosmetics"

    if (!toEmail) return

    await resend.emails.send({
      from:    `${businessName} <noreply@alliocosmetics.com>`,
      to:      toEmail,
      subject: `Your order has shipped — #${order.orderNumber.slice(-8).toUpperCase()}`,
      html: `
        <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
          <div style="text-align:center;padding:40px 0 24px;">
            <h1 style="font-size:26px;font-weight:700;color:#C9A84C;margin:0;">${esc(businessName)}</h1>
          </div>
          <div style="padding:32px;background:#fafaf9;border-radius:16px;border:1px solid #e8e0d4;">
            <h2 style="font-size:20px;font-weight:700;margin:0 0 4px;">Your order is on its way 🚚</h2>
            <p style="color:#888;font-size:12px;margin:0 0 24px;">Order #${order.orderNumber.slice(-8).toUpperCase()}</p>
            <p style="color:#666;font-size:14px;line-height:1.6;margin:0;">
              Hi ${esc(firstName)}, great news — your order has been shipped and is on its way to you.
              You&apos;ll receive it within the estimated delivery window.
            </p>
          </div>
          <p style="text-align:center;font-size:11px;color:#bbb;padding:24px 0;">
            © ${new Date().getFullYear()} ${esc(businessName)}
          </p>
        </div>
      `,
    })
  } catch (err) {
    console.error("[sendShippingNotification]", err)
    // non-fatal
  }
}

// ─── Actions ──────────────────────────────────────────────────────────────────

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

  if (next === "SHIPPED") {
    await sendShippingNotification(orderId)
  }

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

  if (status === "SHIPPED") {
    await sendShippingNotification(orderId)
  }

  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath("/admin/orders")
  return { success: true }
}

export async function saveOrderNotes(_prev: { success: boolean; error?: string } | undefined, fd: FormData) {
  await requireAdmin()

  const orderId    = fd.get("orderId") as string
  const staffNotes = (fd.get("staffNotes") as string) || null

  await prisma.order.update({
    where: { id: orderId },
    data:  { staffNotes },
  })

  revalidatePath(`/admin/orders/${orderId}`)
  return { success: true }
}
