"use server"

import { auth } from "@/auth"

/**
 * Shared server-side guard for all admin server actions and API routes.
 * Throws "Unauthorized" if the caller is not an authenticated ADMIN or SUPERADMIN.
 * Returns the session so callers can access session.user without a second auth() call.
 */
export async function requireAdmin() {
  const session = await auth()
  if (!session || !["ADMIN", "SUPERADMIN"].includes(session.user?.role ?? "")) {
    throw new Error("Unauthorized")
  }
  return session
}
