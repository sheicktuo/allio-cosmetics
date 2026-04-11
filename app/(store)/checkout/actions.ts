"use server"

import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import { auth } from "@/auth"
import { generateOrderNumber } from "@/lib/order-number"
import { z } from "zod"

const schema = z.object({
  // Contact
  name:       z.string().min(1, "Name is required"),
  email:      z.string().email("Valid email is required"),
  phone:      z.string().optional(),
  // Bottle
  brand:      z.string().min(1, "Brand is required"),
  fragrance:  z.string().min(1, "Fragrance name is required"),
  bottleSize: z.string().optional(),
  condition:  z.string().optional(),
  // Delivery
  orderType:  z.enum(["MAIL_IN", "DROPOFF", "PICKUP"]),
  notes:      z.string().optional(),
  promoCode:  z.string().optional(),
  // Cart items passed as JSON string
  cartJson:   z.string(),
})

type CartItem = {
  id:       string
  slug:     string
  name:     string
  price:    number
  quantity: number
}

export async function createOrderAndPaymentIntent(formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" }
  }

  const data    = parsed.data
  const session = await auth()

  let cartItems: CartItem[] = []
  try {
    cartItems = JSON.parse(data.cartJson)
  } catch {
    return { error: "Invalid cart data" }
  }

  if (cartItems.length === 0) return { error: "Your cart is empty" }

  // Resolve services from DB for authoritative prices
  const slugs      = cartItems.map((i) => i.slug)
  const services   = await prisma.service.findMany({ where: { slug: { in: slugs }, isActive: true } })
  const serviceMap = Object.fromEntries(services.map((s) => [s.slug, s]))

  let subtotal = 0
  const lineItems = cartItems.flatMap((item) => {
    const svc = serviceMap[item.slug]
    if (!svc) return []
    const lineTotal = svc.price * item.quantity
    subtotal += lineTotal
    return [{ serviceId: svc.id, quantity: item.quantity, unitPrice: svc.price, total: lineTotal }]
  })

  if (lineItems.length === 0) return { error: "No valid services in cart" }

  // Promo code
  let discount = 0
  let appliedPromo: string | null = null
  if (data.promoCode) {
    const promo = await prisma.promoCode.findUnique({
      where: { code: data.promoCode.toUpperCase() },
    })
    if (
      promo &&
      promo.isActive &&
      (!promo.expiresAt || promo.expiresAt > new Date()) &&
      (!promo.maxUses || promo.usesCount < promo.maxUses) &&
      (!promo.minOrderValue || subtotal >= promo.minOrderValue)
    ) {
      discount =
        promo.discountType === "PERCENTAGE"
          ? Math.round(subtotal * (promo.discountValue / 100))
          : promo.discountValue
      appliedPromo = promo.code
    }
  }

  const total = Math.max(0, subtotal - discount)

  // Create order in DB
  const orderNumber = generateOrderNumber()
  const order = await prisma.serviceOrder.create({
    data: {
      orderNumber,
      userId:        session?.user?.id ?? null,
      guestEmail:    session ? null : data.email,
      guestName:     session ? null : data.name,
      guestPhone:    session ? null : (data.phone ?? null),
      orderType:     data.orderType,
      status:        "PENDING",
      paymentStatus: "UNPAID",
      subtotal,
      discount,
      total,
      promoCode:     appliedPromo,
      notes:         data.notes ?? null,
      items:         { create: lineItems },
      bottles: {
        create: {
          brand:      data.brand,
          fragrance:  data.fragrance,
          bottleSize: data.bottleSize ?? null,
          condition:  data.condition ?? null,
        },
      },
      statusHistory: {
        create: { status: "PENDING", changedBy: session?.user?.id ?? "guest" },
      },
    },
    select: { id: true, orderNumber: true },
  })

  // Create Stripe PaymentIntent (amount already in smallest unit — pence/cents)
  const currency = (process.env.STRIPE_CURRENCY ?? "gbp").toLowerCase()
  const paymentIntent = await stripe.paymentIntents.create({
    amount:   Math.round(total),
    currency,
    metadata: { orderNumber: order.orderNumber, orderId: order.id },
    receipt_email: data.email,
    automatic_payment_methods: { enabled: true },
  })

  // Persist the PaymentIntent ID so the webhook can match it
  await prisma.serviceOrder.update({
    where: { id: order.id },
    data:  { paymentIntentId: paymentIntent.id },
  })

  return {
    clientSecret: paymentIntent.client_secret!,
    orderNumber:  order.orderNumber,
    amount:       total,
  }
}
