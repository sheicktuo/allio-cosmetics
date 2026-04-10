"use server"

import { signIn } from "@/auth"
import { AuthError } from "next-auth"

export async function loginAction(formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirectTo: "/profile/orders",
    })
  } catch (e) {
    // NextAuth throws a redirect — let it propagate
    if (e instanceof AuthError) {
      return { error: "Invalid email or password." }
    }
    throw e
  }
}
