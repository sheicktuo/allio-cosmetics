import Link from "next/link"
import DarkModeToggle from "./dark-mode-toggle"
import CartIcon from "./cart-icon"

function Header() {
  return (
    <div className="border-b border-border bg-background sticky top-0 z-50 backdrop-blur-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold font-heading">A</span>
            </div>
            <span className="text-xl font-bold font-heading tracking-wide text-foreground">
              Allio <span className="text-primary">Cosmetics</span>
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { href: "/shop", label: "Shop" },
              { href: "/shop/collections", label: "Collections" },
              { href: "/track", label: "Track Order" },
              { href: "/about", label: "About" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium tracking-wide"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <DarkModeToggle />
            <CartIcon />
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Login
            </Link>
            <Link
              href="/shop"
              className="hidden sm:block bg-primary hover:opacity-90 text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg transition-opacity"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </nav>
    </div>
  )
}

export default Header
