import Link from "next/link"

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-foreground text-background py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-10 mb-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold font-heading">A</span>
              </div>
              <span className="text-xl font-bold font-heading">
                Allio <span className="text-primary">Cosmetics</span>
              </span>
            </div>
            <p className="opacity-60 text-sm leading-relaxed">
              Premium fragrances delivered to your door. Discover scents that define you.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-bold mb-4 text-sm uppercase tracking-wide font-heading text-primary">Shop</h3>
            <ul className="space-y-2 opacity-60 text-sm">
              <li><Link href="/shop"             className="hover:opacity-100 transition-opacity">All Fragrances</Link></li>
              <li><Link href="/shop/collections" className="hover:opacity-100 transition-opacity">Collections</Link></li>
              <li><Link href="/track"            className="hover:opacity-100 transition-opacity">Track Order</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold mb-4 text-sm uppercase tracking-wide font-heading text-primary">Company</h3>
            <ul className="space-y-2 opacity-60 text-sm">
              <li><Link href="/about" className="hover:opacity-100 transition-opacity">About Us</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="font-bold mb-4 text-sm uppercase tracking-wide font-heading text-primary">Account</h3>
            <ul className="space-y-2 opacity-60 text-sm">
              <li><Link href="/login"          className="hover:opacity-100 transition-opacity">Login</Link></li>
              <li><Link href="/register"       className="hover:opacity-100 transition-opacity">Create Account</Link></li>
              <li><Link href="/profile/orders" className="hover:opacity-100 transition-opacity">My Orders</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 pt-8 flex flex-col md:flex-row justify-between items-center opacity-50 text-sm gap-4">
          <p>&copy; {year} Allio Cosmetics. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:opacity-100 transition-opacity">Privacy Policy</Link>
            <Link href="/terms"   className="hover:opacity-100 transition-opacity">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
