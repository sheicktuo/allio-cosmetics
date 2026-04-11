"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import SignOutModal from "@/components/admin/sign-out-modal"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold font-heading shrink-0 select-none">
      {initials || "?"}
    </div>
  )
}

export default function UserMenu() {
  const { data: session, status } = useSession()
  const user = session?.user

  if (status === "loading") {
    return <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
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
    )
  }

  const isAdmin = user.role === "ADMIN" || user.role === "SUPERADMIN"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full pl-0.5 pr-2 py-0.5 hover:bg-muted transition-colors group">
          <UserAvatar name={user.name ?? user.email ?? "U"} />
          <span className="hidden lg:block text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors max-w-[100px] truncate">
            {user.name?.split(" ")[0] ?? "Account"}
          </span>
          <svg className="w-3 h-3 text-muted-foreground hidden lg:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-2xl p-1">
        <DropdownMenuLabel className="px-3 py-2">
          <p className="text-sm font-bold truncate">{user.name ?? "Customer"}</p>
          <p className="text-xs text-muted-foreground truncate font-normal">{user.email}</p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/profile/orders" className="flex items-center gap-2.5 px-3 py-2 cursor-pointer rounded-lg">
            <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            My Orders
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center gap-2.5 px-3 py-2 cursor-pointer rounded-lg">
            <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile
          </Link>
        </DropdownMenuItem>

        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/dashboard" className="flex items-center gap-2.5 px-3 py-2 cursor-pointer rounded-lg">
                <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Admin Panel
              </Link>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />

        {/* Reuse the existing sign-out modal */}
        <div className="px-1 py-0.5">
          <SignOutModal variant="menu-item" />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
