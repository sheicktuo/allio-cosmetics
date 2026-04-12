"use server"

import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import { auth } from "@/auth"
import { generateOrderNumber } from "@/lib/order-number"
import { z } from "zod"

const schema = z.object({
  // Contact
  name:  z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  // Delivery method
  deliveryMethod: z.enum(["DELIVERY", "PICKUP"]).default("DELIVERY"),
  // Shipping address (required only for DELIVERY — validated below)
  shippingName:     z.string().optional(),
  shippingLine1:    z.string().optional(),
  shippingLine2:    z.string().optional(),
  shippingCity:     z.string().optional(),
  shippingPostcode: z.string().optional(),
  shippingCountry:  z.string().optional(),
  // Order
  notes:     z.string().optional(),
  promoCode: z.string().optional(),
  // Cart items passed as JSON string
  cartJson: z.string(),
})

type CartItem = {
  id:        string
  productId: string
  slug:      string
  name:      string
  price:     number
  quantity:  number
  sizeId?:   string
  sizeLabel?: string
}

export async function createOrderAndPaymentIntent(formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" }
  }

  const data    = parsed.data
  const session = await auth()

  // Validate shipping fields when delivery method is DELIVERY
  if (data.deliveryMethod === "DELIVERY") {
    if (!data.shippingName?.trim())     return { error: "Shipping name is required" }
    if (!data.shippingLine1?.trim())    return { error: "Address line 1 is required" }
    if (!data.shippingCity?.trim())     return { error: "City is required" }
    if (!data.shippingPostcode?.trim()) return { error: "Postcode is required" }
    if (!data.shippingCountry?.trim())  return { error: "Country is required" }
  }

  let cartItems: CartItem[] = []
  try {
    cartItems = JSON.parse(data.cartJson)
  } catch {
    return { error: "Invalid cart data" }
  }

  if (cartItems.length === 0) return { error: "Your cart is empty" }

  // Resolve authoritative prices from DB
  const slugs    = cartItems.map((i) => i.slug)
  const sizeIds  = cartItems.flatMap((i) => i.sizeId ? [i.sizeId] : [])

  const [products, sizes] = await Promise.all([
    prisma.product.findMany({ where: { slug: { in: slugs }, isActive: true } }),
    sizeIds.length > 0
      ? prisma.productSize.findMany({ where: { id: { in: sizeIds }, isActive: true } })
      : Promise.resolve([]),
  ])

  const productMap = Object.fromEntries(products.map((p) => [p.slug, p]))
  const sizeMap    = Object.fromEntries(sizes.map((s) => [s.id, s]))

  let subtotal = 0
  const lineItems = cartItems.flatMap((item) => {
    const product = productMap[item.slug]
    if (!product) return []
    const size      = item.sizeId ? sizeMap[item.sizeId] : null
    const unitPrice = size ? size.price : product.price
    const lineTotal = unitPrice * item.quantity
    subtotal += lineTotal
    return [{
      productId: product.id,
      sizeId:    size?.id    ?? null,
      sizeLabel: size?.label ?? item.sizeLabel ?? null,
      quantity:  item.quantity,
      unitPrice,
      total:     lineTotal,
    }]
  })

  if (lineItems.length === 0) return { error: "No valid products in cart" }

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
  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId:           session?.user?.id ?? null,
      guestEmail:       session ? null : data.email,
      guestName:        session ? null : data.name,
      guestPhone:       session ? null : (data.phone ?? null),
      status:           "PENDING",
      paymentStatus:    "UNPAID",
      deliveryMethod:   data.deliveryMethod,
      subtotal,
      discount,
      total,
      promoCode:        appliedPromo,
      notes:            data.notes ?? null,
      shippingName:     data.deliveryMethod === "DELIVERY" ? (data.shippingName ?? null) : null,
      shippingLine1:    data.deliveryMethod === "DELIVERY" ? (data.shippingLine1 ?? null) : null,
      shippingLine2:    data.deliveryMethod === "DELIVERY" ? (data.shippingLine2 ?? null) : null,
      shippingCity:     data.deliveryMethod === "DELIVERY" ? (data.shippingCity ?? null) : null,
      shippingPostcode: data.deliveryMethod === "DELIVERY" ? (data.shippingPostcode ?? null) : null,
      shippingCountry:  data.deliveryMethod === "DELIVERY" ? (data.shippingCountry ?? null) : null,
      items:            { create: lineItems },
      statusHistory:    { create: { status: "PENDING", changedBy: session?.user?.id ?? "guest" } },
    },
    select: { id: true, orderNumber: true },
  })

  // Create Stripe PaymentIntent (amount already in smallest unit — pence/cents)
  const currency = (process.env.STRIPE_CURRENCY ?? "cad").toLowerCase()
  const paymentIntent = await stripe.paymentIntents.create({
    amount:   Math.round(total),
    currency,
    metadata: { orderNumber: order.orderNumber, orderId: order.id },
    receipt_email: data.email,
    automatic_payment_methods: { enabled: true },
  })

  await prisma.order.update({
    where: { id: order.id },
    data:  { paymentIntentId: paymentIntent.id },
  })

  return {
    clientSecret: paymentIntent.client_secret!,
    orderNumber:  order.orderNumber,
    amount:       total,
  }
}
