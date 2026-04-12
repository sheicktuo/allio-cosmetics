import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET(req: NextRequest, { params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params
  const session = await auth()

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    select: {
      orderNumber:       true,
      status:            true,
      estimatedDelivery: true,
      createdAt:         true,
      userId:            true,
      guestEmail:        true,
      statusHistory: {
        orderBy: { createdAt: "asc" },
        select:  { status: true, note: true, createdAt: true },
      },
      items: {
        select: { product: { select: { name: true } }, quantity: true, total: true },
      },
    },
  })

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  // Authorization: must be the order owner, an admin, or provide matching guest email
  const isAdmin = ["ADMIN", "SUPERADMIN"].includes(session?.user?.role ?? "")
  const isOwner = session?.user?.id && order.userId === session.user.id

  if (!isAdmin && !isOwner) {
    // Allow guests to look up by providing their email as a query param
    const emailParam = req.nextUrl.searchParams.get("email")?.toLowerCase()
    const isGuestMatch = order.guestEmail && emailParam === order.guestEmail.toLowerCase()

    if (!isGuestMatch) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }
  }

  // Strip internal fields before returning
  const { userId: _, guestEmail: __, ...safeOrder } = order
  return NextResponse.json({ order: safeOrder })
}
