"use client"

import { useState } from "react"
import AdminSidebar from "./admin-sidebar"
import AdminNavbar  from "./admin-navbar"

type Props = {
  userName?:   string | null
  userRole?:   string | null
  newOrders:   number
  newRequests: number
  children:    React.ReactNode
}

export default function AdminShell({
  userName,
  userRole,
  newOrders,
  newRequests,
  children,
}: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background flex">

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <AdminSidebar
        newOrders={newOrders}
        newRequests={newRequests}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Right column */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar
          userName={userName}
          userRole={userRole}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

    </div>
  )
}
