import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const schema = z.object({
  name:     z.string().min(1, "Name is required"),
  email:    z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone:    z.string().optional(),
})

export async function POST(req: NextRequest) {
  const formData = await req.formData()

  const parsed = schema.safeParse({
    name:     formData.get("name"),
    email:    formData.get("email"),
    password: formData.get("password"),
    phone:    formData.get("phone") || undefined,
  })

  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? "Invalid input"
    return NextResponse.redirect(
      new URL(`/register?error=${encodeURIComponent(message)}`, req.url),
      303
    )
  }

  const { name, email, password, phone } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.redirect(new URL("/register?error=EmailTaken", req.url), 303)
  }

  const passwordHash = await bcrypt.hash(password, 12)

  await prisma.user.create({
    data: { name, email, passwordHash, phone: phone ?? null, role: "CUSTOMER" },
  })

  return NextResponse.redirect(new URL("/login?registered=1", req.url), 303)
}
