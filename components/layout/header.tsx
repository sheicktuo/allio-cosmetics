import Link from "next/link"
import DarkModeToggle from "./dark-mode-toggle"

function Header() {
  return (
    <div className="border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-rose-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">A</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Allio Cosmetics</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/services" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm font-medium">
              Services
            </Link>
            <Link href="/book" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm font-medium">
              Book
            </Link>
            <Link href="/track" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm font-medium">
              Track Order
            </Link>
            <Link href="/about" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm font-medium">
              About
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <DarkModeToggle />
            <Link
              href="/login"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
            >
              Login
            </Link>
            <Link
              href="/book"
              className="hidden sm:block bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Book Now
            </Link>
          </div>
        </div>
      </nav>
    </div>
  )
}

export default Header