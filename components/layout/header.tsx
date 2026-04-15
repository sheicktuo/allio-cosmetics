"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import DarkModeToggle from "./dark-mode-toggle"
import CartDrawer from "./cart-drawer"
import NotificationsBell from "./notifications-bell"
import UserMenu from "./user-menu"

const NAV_LINKS = [
  { href: "/shop",             label: "Shop" },
  { href: "/shop/collections", label: "Collections" },
  { href: "/track",            label: "Track Order" },
  { href: "/about",            label: "About" },
]

const CTA_LINK = { href: "/book", label: "Make a Request" }

function Header() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <div className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[68px] flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold font-heading">A</span>
            </div>
            <span className="text-xl font-bold font-heading tracking-wide text-foreground">
              Allio <span className="text-primary">Cosmetics</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium tracking-wide transition-colors ${
                  pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={CTA_LINK.href}
              className={`text-sm font-semibold px-4 py-1.5 rounded-full border transition-colors ${
                pathname === CTA_LINK.href
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              }`}
            >
              {CTA_LINK.label}
            </Link>
          </div>

          {/* Desktop right actions */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <DarkModeToggle />
            <NotificationsBell />
            <CartDrawer />
            <UserMenu />
          </div>

          {/* Mobile right actions */}
          <div className="flex md:hidden items-center gap-2">
            <NotificationsBell />
            <CartDrawer />
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              aria-expanded={mobileOpen}
              aria-label="Menu"
            >
              {mobileOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        <div className={`md:hidden border-t border-border overflow-hidden transition-all duration-300 ${mobileOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="px-4 py-3 space-y-0.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center px-3 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  pathname === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Make a Request CTA */}
            <Link
              href={CTA_LINK.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center px-3 py-3 rounded-xl text-sm font-semibold
                         bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              {CTA_LINK.label}
            </Link>

            {/* Divider + mobile user actions */}
            <div className="pt-2 border-t border-border mt-2 flex items-center justify-between px-3 py-2">
              <DarkModeToggle />
              <UserMenu />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  )
}

export default Header
