"use client"

import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import DarkModeToggle from "@/components/layout/dark-mode-toggle"

const pageTitles: Record<string, string> = {
  "/admin/dashboard":   "Dashboard",
  "/admin/orders":      "Orders",
  "/admin/services":    "Services",
  "/admin/customers":   "Customers",
  "/admin/promo-codes": "Promo Codes",
  "/admin/analytics":   "Analytics",
  "/admin/settings":    "Settings",
}

type Props = {
  userName?: string | null
  userRole?: string | null
}

export default function AdminNavbar({ userName, userRole }: Props) {
  const pathname = usePathname()

  // Match the longest prefix
  const title =
    Object.entries(pageTitles)
      .sort((a, b) => b[0].length - a[0].length)
      .find(([key]) => pathname.startsWith(key))?.[1] ?? "Admin"

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6 flex-shrink-0">
      {/* Page title */}
      <h1 className="font-heading font-semibold text-foreground">{title}</h1>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <DarkModeToggle />

        {/* User badge */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-border">
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground text-xs font-bold font-heading">
              {userName?.[0]?.toUpperCase() ?? "A"}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-foreground leading-none">{userName ?? "Admin"}</p>
            <p className="text-xs text-muted-foreground leading-none mt-0.5">{userRole ?? "ADMIN"}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="ml-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
            title="Sign out"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
