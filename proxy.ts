import { auth } from "@/auth"
import { NextResponse } from "next/server"

const ROLE_HOME: Record<string, string> = {
  SUPERADMIN: "/admin/dashboard",
  ADMIN:      "/admin/dashboard",
  STAFF:      "/staff",
  CUSTOMER:   "/profile/orders",
}

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth
  const role = session?.user?.role ?? ""

  // ── Already logged in — block access to auth pages ────────────────────
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    if (session) {
      const dest = ROLE_HOME[role] ?? "/profile/orders"
      return NextResponse.redirect(new URL(dest, req.url))
    }
    return NextResponse.next()
  }

  // ── Admin routes — ADMIN or SUPERADMIN only ───────────────────────────
  if (pathname.startsWith("/admin")) {
    if (!session) {
      return NextResponse.redirect(new URL(`/login?from=${pathname}`, req.url))
    }
    if (role !== "ADMIN" && role !== "SUPERADMIN") {
      return NextResponse.redirect(new URL(ROLE_HOME[role] ?? "/", req.url))
    }
  }

  // ── Staff routes — STAFF, ADMIN, or SUPERADMIN ────────────────────────
  if (pathname.startsWith("/staff")) {
    if (!session) {
      return NextResponse.redirect(new URL(`/login?from=${pathname}`, req.url))
    }
    if (!["STAFF", "ADMIN", "SUPERADMIN"].includes(role)) {
      return NextResponse.redirect(new URL(ROLE_HOME[role] ?? "/", req.url))
    }
  }

  // ── Profile / account — any authenticated user ───────────────────────
  if (pathname.startsWith("/profile") || pathname.startsWith("/account")) {
    if (!session) {
      return NextResponse.redirect(new URL(`/login?from=${pathname}`, req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/login",
    "/register",
    "/admin/:path*",
    "/staff/:path*",
    "/profile/:path*",
    "/account/:path*",
  ],
}
