import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(_req: NextRequest, { params }: { params: { orderNumber: string } }) {
  const order = await prisma.serviceOrder.findUnique({
    where: { orderNumber: params.orderNumber },
    select: {
      orderNumber: true,
      status: true,
      orderType: true,
      estimatedReady: true,
      createdAt: true,
      statusHistory: {
        orderBy: { createdAt: "asc" },
        select: { status: true, note: true, createdAt: true },
      },
      bottles: {
        select: { brand: true, fragrance: true },
      },
      items: {
        select: { service: { select: { name: true } } },
      },
    },
  })

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  return NextResponse.json({ order })
}
