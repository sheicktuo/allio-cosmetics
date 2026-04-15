import { auth }      from "@/auth"
import { redirect }  from "next/navigation"
import { prisma }    from "@/lib/prisma"
import AdminShell    from "@/components/admin/admin-shell"

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
    <AdminShell
      userName={session.user?.name}
      userRole={session.user?.role}
      newOrders={newOrders}
      newRequests={newRequests}
    >
      {children}
    </AdminShell>
  )
}
