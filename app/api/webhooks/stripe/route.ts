import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object as Stripe.PaymentIntent
    const orderNumber = pi.metadata?.orderNumber

    if (orderNumber) {
      await prisma.serviceOrder.update({
        where: { orderNumber },
        data: {
          paymentStatus: "PAID",
          paymentIntentId: pi.id,
          status: "CONFIRMED",
          statusHistory: {
            create: { status: "CONFIRMED", changedBy: "stripe", note: "Payment confirmed" },
          },
        },
      })
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const pi = event.data.object as Stripe.PaymentIntent
    const orderNumber = pi.metadata?.orderNumber

    if (orderNumber) {
      await prisma.serviceOrder.update({
        where: { orderNumber },
        data: { paymentStatus: "FAILED" },
      })
    }
  }

  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge
    const pi = charge.payment_intent as string

    if (pi) {
      await prisma.serviceOrder.updateMany({
        where: { paymentIntentId: pi },
        data: { paymentStatus: "REFUNDED", status: "REFUNDED" },
      })
    }
  }

  return NextResponse.json({ received: true })
}
