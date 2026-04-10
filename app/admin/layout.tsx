import { auth } from "@/auth"
import { redirect } from "next/navigation"
import AdminSidebar from "@/components/admin/admin-sidebar"
import AdminNavbar from "@/components/admin/admin-navbar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session || !["ADMIN", "SUPERADMIN"].includes(session.user?.role ?? "")) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />

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
