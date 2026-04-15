export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { stripe }  from "@/lib/stripe"
import { prisma }  from "@/lib/prisma"
import { resend }  from "@/lib/resend"
import Stripe from "stripe"

// ─── Helpers ─────────────────────────────────────────────────────────────────

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;")
}

function fmt(n: number) {
  return `CA$${n.toFixed(2)}`
}

async function notifyUser(userId: string, orderNumber: string, status: string) {
  try {
    const { getPusherServer } = await import("@/lib/pusher-server")
    await getPusherServer()?.trigger(`user-${userId}`, "order-status", { orderNumber, status })
  } catch {
    // non-fatal
  }
}

async function sendOrderConfirmation(orderNumber: string) {
  try {
    const [order, settings] = await Promise.all([
      prisma.order.findUnique({
        where:   { orderNumber },
        include: {
          user:  { select: { name: true, email: true } },
          items: { include: { product: { select: { name: true } } } },
        },
      }),
      prisma.businessSettings.findFirst({ select: { email: true, businessName: true } }),
    ])

    if (!order) return

    const toEmail      = order.user?.email ?? order.guestEmail
    const toName       = order.user?.name  ?? order.guestName ?? "Customer"
    const firstName    = toName.split(" ")[0]
    const businessName = settings?.businessName ?? "Allio Cosmetics"

    if (!toEmail) return

    const itemRows = order.items.map((it) => `
      <tr>
        <td style="padding:10px 0;font-size:14px;color:#1a1a1a;border-bottom:1px solid #f0ece4;">
          ${esc(it.product.name)}${it.sizeLabel ? ` <span style="color:#888;font-size:12px;">(${esc(it.sizeLabel)})</span>` : ""}
          ${it.quantity > 1 ? ` <span style="color:#888;font-size:12px;">× ${it.quantity}</span>` : ""}
        </td>
        <td style="padding:10px 0;font-size:14px;color:#1a1a1a;text-align:right;border-bottom:1px solid #f0ece4;">
          ${fmt(it.total)}
        </td>
      </tr>`).join("")

    const hasDelivery = order.deliveryMethod === "DELIVERY"
    const shippingBlock = hasDelivery && order.shippingLine1 ? `
      <div style="margin-top:20px;">
        <p style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:.1em;margin:0 0 6px;">Shipping to</p>
        <p style="font-size:13px;color:#444;margin:0;line-height:1.6;">
          ${esc(order.shippingName ?? toName)}<br/>
          ${esc(order.shippingLine1)}${order.shippingLine2 ? `<br/>${esc(order.shippingLine2)}` : ""}<br/>
          ${esc(order.shippingCity ?? "")} ${esc(order.shippingPostcode ?? "")}<br/>
          ${esc(order.shippingCountry ?? "")}
        </p>
      </div>` : hasDelivery ? "" : `
      <div style="margin-top:20px;">
        <p style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:.1em;margin:0 0 6px;">Pickup order</p>
        <p style="font-size:13px;color:#444;margin:0;">We&apos;ll contact you when your order is ready to collect.</p>
      </div>`

    await resend.emails.send({
      from:    `${businessName} <noreply@alliocosmetics.com>`,
      to:      toEmail,
      subject: `Order confirmed — #${orderNumber.slice(-8).toUpperCase()}`,
      html: `
        <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
          <div style="text-align:center;padding:40px 0 24px;">
            <h1 style="font-size:26px;font-weight:700;color:#C9A84C;margin:0;">${esc(businessName)}</h1>
          </div>
          <div style="padding:32px;background:#fafaf9;border-radius:16px;border:1px solid #e8e0d4;">
            <h2 style="font-size:20px;font-weight:700;margin:0 0 4px;">Order Confirmed ✓</h2>
            <p style="color:#888;font-size:12px;margin:0 0 24px;">Order #${orderNumber.slice(-8).toUpperCase()}</p>
            <p style="color:#666;font-size:14px;line-height:1.6;margin:0 0 24px;">
              Hi ${esc(firstName)}, your payment was received and your order is confirmed.
              We&apos;ll let you know as soon as it ships.
            </p>

            <div style="background:#fff;border-radius:12px;padding:20px;border:1px solid #e8e0d4;">
              <table style="width:100%;border-collapse:collapse;">
                ${itemRows}
              </table>
              <table style="width:100%;border-collapse:collapse;margin-top:12px;">
                ${order.discount > 0 ? `<tr><td style="padding:4px 0;font-size:13px;color:#888;">Discount</td><td style="padding:4px 0;font-size:13px;color:#888;text-align:right;">−${fmt(order.discount)}</td></tr>` : ""}
                ${order.deliveryFee > 0 ? `<tr><td style="padding:4px 0;font-size:13px;color:#888;">Delivery</td><td style="padding:4px 0;font-size:13px;color:#888;text-align:right;">${fmt(order.deliveryFee)}</td></tr>` : ""}
                ${order.taxAmount > 0 ? `<tr><td style="padding:4px 0;font-size:13px;color:#888;">Tax</td><td style="padding:4px 0;font-size:13px;color:#888;text-align:right;">${fmt(order.taxAmount)}</td></tr>` : ""}
                <tr>
                  <td style="padding:8px 0 0;font-size:15px;font-weight:700;border-top:1px solid #f0ece4;">Total</td>
                  <td style="padding:8px 0 0;font-size:15px;font-weight:700;text-align:right;border-top:1px solid #f0ece4;color:#C9A84C;">${fmt(order.total)}</td>
                </tr>
              </table>
              ${shippingBlock}
            </div>
          </div>
          <p style="text-align:center;font-size:11px;color:#bbb;padding:24px 0;">
            © ${new Date().getFullYear()} ${esc(businessName)}
          </p>
        </div>
      `,
    })
  } catch (err) {
    console.error("[sendOrderConfirmation]", err)
    // non-fatal — order is confirmed in DB regardless
  }
}

// ─── Webhook handler ─────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get("stripe-signature")

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  if (event.type === "payment_intent.succeeded") {
    const pi          = event.data.object as Stripe.PaymentIntent
    const orderNumber = pi.metadata?.orderNumber

    if (orderNumber) {
      const order = await prisma.order.update({
        where: { orderNumber },
        data: {
          paymentStatus:   "PAID",
          paymentIntentId: pi.id,
          status:          "CONFIRMED",
          statusHistory: {
            create: { status: "CONFIRMED", changedBy: "stripe", note: "Payment confirmed" },
          },
        },
        select: { userId: true },
      })

      // Send confirmation email and Pusher notification in parallel — both non-fatal
      await Promise.allSettled([
        sendOrderConfirmation(orderNumber),
        order.userId ? notifyUser(order.userId, orderNumber, "CONFIRMED") : Promise.resolve(),
      ])
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const pi          = event.data.object as Stripe.PaymentIntent
    const orderNumber = pi.metadata?.orderNumber

    if (orderNumber) {
      await prisma.order.update({
        where: { orderNumber },
        data:  { paymentStatus: "FAILED" },
      })
    }
  }

  if (event.type === "payment_intent.canceled") {
    const pi          = event.data.object as Stripe.PaymentIntent
    const orderNumber = pi.metadata?.orderNumber

    if (orderNumber) {
      await prisma.order.updateMany({
        where: { orderNumber, status: "PENDING" },
        data:  { status: "CANCELLED", paymentStatus: "FAILED" },
      })
    }
  }

  if (event.type === "charge.refunded") {
    const charge  = event.data.object as Stripe.Charge
    const piId    = charge.payment_intent as string
    const partial = charge.amount_refunded < charge.amount

    if (piId) {
      await prisma.order.updateMany({
        where: { paymentIntentId: piId },
        data:  {
          paymentStatus: partial ? "PARTIALLY_REFUNDED" : "REFUNDED",
          status:        partial ? undefined : "REFUNDED",
        },
      })
    }
  }

  return NextResponse.json({ received: true })
}
