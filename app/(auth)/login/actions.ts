"use server"

import { signIn } from "@/auth"
import { prisma } from "@/lib/prisma"
import { AuthError } from "next-auth"

const ROLE_HOME: Record<string, string> = {
  SUPERADMIN: "/admin/dashboard",
  ADMIN:      "/admin/dashboard",
  STAFF:      "/staff",
  CUSTOMER:   "/profile/orders",
}

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const from = (formData.get("from") as string | null) || null

  // Look up role before signing in so we can redirect correctly.
  // Auth still happens inside NextAuth's authorize() — this is only for routing.
  let redirectTo = "/profile/orders"
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { role: true },
    })
    if (user) {
      // If the user was sent to login from a protected page, honour that URL
      // only for customers — admins/staff always go to their dashboard.
      if (user.role === "CUSTOMER" && from) {
        redirectTo = from
      } else {
        redirectTo = ROLE_HOME[user.role] ?? "/profile/orders"
      }
    }
  } catch {
    // DB unreachable — fall back to default, auth will still validate
  }

  try {
    await signIn("credentials", { email, password, redirectTo })
  } catch (e) {
    if (e instanceof AuthError) {
      return { error: "Invalid email or password." }
    }
    throw e
  }
}
