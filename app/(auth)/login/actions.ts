"use server"

import { signIn } from "@/auth"
import { prisma } from "@/lib/prisma"
import { AuthError } from "next-auth"
import { isRedirectError } from "next/dist/client/components/redirect-error"

const ROLE_HOME: Record<string, string> = {
  SUPERADMIN: "/admin/dashboard",
  ADMIN:      "/admin/dashboard",
  STAFF:      "/staff",
  CUSTOMER:   "/profile/orders",
}

export async function loginAction(
  _: unknown,
  formData: FormData,
): Promise<{ error: string } | { success: true; redirectTo: string }> {
  const email    = formData.get("email") as string
  const password = formData.get("password") as string
  const from     = (formData.get("from") as string | null) || null

  let redirectTo = "/profile/orders"
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { role: true },
    })
    if (user) {
      if (user.role === "CUSTOMER" && from) {
        redirectTo = from
      } else {
        redirectTo = ROLE_HOME[user.role] ?? "/profile/orders"
      }
    }
  } catch {
    // DB unreachable — fall back to default
  }

  try {
    await signIn("credentials", { email, password, redirect: false })
    return { success: true, redirectTo }
  } catch (e) {
    if (isRedirectError(e)) throw e
    if (e instanceof AuthError) {
      const type = (e as AuthError).type
      if (type === "CredentialsSignin") {
        return { error: "Invalid email or password." }
      }
      return { error: "Authentication failed. Please try again." }
    }
    return { error: "Something went wrong. Please try again." }
  }
}
