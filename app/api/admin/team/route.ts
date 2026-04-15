import { NextResponse }  from "next/server"
import { auth }          from "@/auth"
import { prisma }        from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session || !["ADMIN", "SUPERADMIN"].includes(session.user?.role ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const admins = await prisma.user.findMany({
    where:   { role: { in: ["ADMIN", "SUPERADMIN"] } },
    select:  { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  })

  return NextResponse.json(admins)
}
