"use client"

import { usePathname } from "next/navigation"
import DarkModeToggle  from "@/components/layout/dark-mode-toggle"
import SignOutModal    from "@/components/admin/sign-out-modal"

const pageTitles: Record<string, string> = {
  "/admin/dashboard":   "Dashboard",
  "/admin/orders":      "Orders",
  "/admin/requests":    "Requests",
  "/admin/shop":        "Shop",
  "/admin/customers":   "Customers",
  "/admin/team":        "Team",
  "/admin/promo-codes": "Promo Codes",
  "/admin/analytics":   "Analytics",
  "/admin/settings":    "Settings",
}

type Props = {
  userName?:   string | null
  userRole?:   string | null
  onMenuClick: () => void
}

export default function AdminNavbar({ userName, userRole, onMenuClick }: Props) {
  const pathname = usePathname()

  const title =
    Object.entries(pageTitles)
      .sort((a, b) => b[0].length - a[0].length)
      .find(([key]) => pathname.startsWith(key))?.[1] ?? "Admin"

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 sm:px-6 shrink-0">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Page title */}
        <h1 className="font-heading font-semibold text-foreground">{title}</h1>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <DarkModeToggle />

        {/* User badge */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-border">
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0">
            <span className="text-primary-foreground text-xs font-bold font-heading">
              {userName?.[0]?.toUpperCase() ?? "A"}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-foreground leading-none">{userName ?? "Admin"}</p>
            <p className="text-xs text-muted-foreground leading-none mt-0.5">{userRole ?? "ADMIN"}</p>
          </div>
          <SignOutModal />
        </div>
      </div>
    </header>
  )
}
