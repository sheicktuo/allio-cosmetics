import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { generateOrderNumber } from "@/lib/order-number"
import { z } from "zod"

const schema = z.object({
  brand: z.string().min(1),
  fragrance: z.string().min(1),
  bottleSize: z.string().optional(),
  condition: z.string().optional(),
  serviceSlug: z.string(),
  orderType: z.enum(["MAIL_IN", "DROPOFF", "PICKUP"]),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  notes: z.string().optional(),
  promoCode: z.string().optional(),
})

const SERVICE_PRICES: Record<string, number> = {
  "full-reconditioning": 4900,
  "scent-refresh": 2900,
  "bottle-restoration": 1900,
  "atomiser-service": 1200,
  "custom-blending": 7900,
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 })
  }

  const session = await auth()
  const data = parsed.data

  const price = SERVICE_PRICES[data.serviceSlug]
  if (!price) {
    return NextResponse.json({ error: "Unknown service" }, { status: 400 })
  }

  const service = await prisma.service.findUnique({ where: { slug: data.serviceSlug } })
  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 })
  }

  let discount = 0
  if (data.promoCode) {
    const promo = await prisma.promoCode.findUnique({ where: { code: data.promoCode.toUpperCase() } })
    if (promo && promo.isActive && (!promo.expiresAt || promo.expiresAt > new Date())) {
      discount =
        promo.discountType === "PERCENTAGE"
          ? Math.round(price * (promo.discountValue / 100))
          : promo.discountValue
    }
  }

  const total = Math.max(0, price - discount)

  const order = await prisma.serviceOrder.create({
    data: {
      orderNumber: generateOrderNumber(),
      userId: session?.user?.id ?? null,
      guestEmail: session ? null : data.email,
      guestName: session ? null : data.name,
      guestPhone: session ? null : data.phone,
      orderType: data.orderType,
      status: "PENDING",
      paymentStatus: "UNPAID",
      subtotal: price,
      discount,
      total,
      promoCode: data.promoCode ?? null,
      notes: data.notes ?? null,
      items: {
        create: {
          serviceId: service.id,
          quantity: 1,
          unitPrice: price,
          total: price,
        },
      },
      bottles: {
        create: {
          brand: data.brand,
          fragrance: data.fragrance,
          bottleSize: data.bottleSize ?? null,
          condition: data.condition ?? null,
        },
      },
      statusHistory: {
        create: {
          status: "PENDING",
          changedBy: "system",
        },
      },
    },
    select: { id: true, orderNumber: true, total: true },
  })

  return NextResponse.json({ order }, { status: 201 })
}
