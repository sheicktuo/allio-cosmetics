"use client"

import Link from "next/link"
import { useCart } from "@/store/cart"

export default function CartIcon() {
  const count = useCart((s) => s.count())

  return (
    <Link
      href="/cart"
      className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-muted transition-colors"
      aria-label="Cart"
    >
      <svg
        className="w-5 h-5 text-foreground"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 w-4.5 h-4.5 min-w-[1.1rem] text-[10px] font-bold bg-primary text-primary-foreground rounded-full flex items-center justify-center leading-none px-1">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  )
}
