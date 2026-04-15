import { auth }    from "@/auth"
import { redirect } from "next/navigation"
import { prisma }   from "@/lib/prisma"
import AdminSidebar from "@/components/admin/admin-sidebar"
import AdminNavbar  from "@/components/admin/admin-navbar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session || !["ADMIN", "SUPERADMIN"].includes(session.user?.role ?? "")) {
    redirect("/login")
  }

  const [newOrders, newRequests] = await Promise.all([
    prisma.order.count({ where: { status: "CONFIRMED" } }),
    prisma.customRequest.count({ where: { status: "NEW" } }),
  ])

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar newOrders={newOrders} newRequests={newRequests} />

      {/* Right column: navbar + page content */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar
          userName={session.user?.name}
          userRole={session.user?.role}
        />
        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
