import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Admin routes — require ADMIN or SUPERADMIN
  if (pathname.startsWith("/admin")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login?from=/admin", req.url))
    }
    const role = session.user?.role
    if (role !== "ADMIN" && role !== "SUPERADMIN") {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  // Staff routes — require STAFF, ADMIN, or SUPERADMIN
  if (pathname.startsWith("/staff")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login?from=/staff", req.url))
    }
    const role = session.user?.role
    if (!["STAFF", "ADMIN", "SUPERADMIN"].includes(role ?? "")) {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  // Profile/account routes — require any authenticated user
  if (pathname.startsWith("/profile") || pathname.startsWith("/account")) {
    if (!session) {
      return NextResponse.redirect(new URL(`/login?from=${pathname}`, req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/admin/:path*", "/staff/:path*", "/profile/:path*", "/account/:path*"],
}
