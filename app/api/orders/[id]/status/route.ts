import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

const STATUS_FLOW = [
  "PENDING",
  "CONFIRMED",
  "RECEIVED",
  "ASSESSING",
  "RECONDITIONING",
  "QUALITY_CHECK",
  "READY",
  "DELIVERED",
] as const

type OrderStatus = (typeof STATUS_FLOW)[number]

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || !["ADMIN", "SUPERADMIN"].includes(session.user?.role ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const order = await prisma.serviceOrder.findUnique({ where: { id } })
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const currentIndex = STATUS_FLOW.indexOf(order.status as OrderStatus)
  if (currentIndex === -1 || currentIndex >= STATUS_FLOW.length - 1) {
    return NextResponse.json({ error: "Cannot advance status" }, { status: 400 })
  }

  const nextStatus = STATUS_FLOW[currentIndex + 1]

  const updated = await prisma.serviceOrder.update({
    where: { id },
    data: {
      status: nextStatus,
      statusHistory: {
        create: { status: nextStatus, changedBy: session.user.id },
      },
    },
  })

  return NextResponse.json({ order: updated })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || !["ADMIN", "SUPERADMIN"].includes(session.user?.role ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const { status, note } = await req.json()
  if (!STATUS_FLOW.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  const updated = await prisma.serviceOrder.update({
    where: { id },
    data: {
      status,
      statusHistory: {
        create: { status, note: note ?? null, changedBy: session.user.id },
      },
    },
  })

  return NextResponse.json({ order: updated })
}
