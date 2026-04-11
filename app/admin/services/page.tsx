import { prisma } from "@/lib/prisma"
import { toggleServiceActive, toggleServiceFeatured } from "./actions"
import { ToggleSwitch } from "@/components/admin/toggle-switch"

export const metadata = { title: "Services — Admin" }

export default async function AdminServicesPage() {
  const categories = await prisma.serviceCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      services: {
        orderBy: { sortOrder: "asc" },
        include: { _count: { select: { orderItems: true } } },
      },
    },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Services</h1>
        <span className="text-sm text-muted-foreground">
          {categories.reduce((n, c) => n + c.services.length, 0)} services across {categories.length} categories
        </span>
      </div>

      {categories.length === 0 && (
        <div className="bg-card rounded-xl border border-border px-5 py-16 text-center text-muted-foreground">
          No services yet. Run the seed script to populate services.
        </div>
      )}

      <div className="space-y-6">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-muted/50 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-foreground">{cat.name}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">/{cat.slug}</p>
              </div>
              <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                {cat.services.length} service{cat.services.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide border-b border-border">
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Price</th>
                    <th className="px-5 py-3">Turnaround</th>
                    <th className="px-5 py-3">Orders</th>
                    <th className="px-5 py-3">Active</th>
                    <th className="px-5 py-3">Featured</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {cat.services.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-6 text-center text-muted-foreground text-sm">
                        No services in this category
                      </td>
                    </tr>
                  )}
                  {cat.services.map((svc) => (
                    <tr key={svc.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3">
                        <p className="text-sm font-medium text-foreground">{svc.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 font-mono">{svc.slug}</p>
                      </td>
                      <td className="px-5 py-3 text-sm font-medium text-foreground">
                        CA${(svc.price / 100).toFixed(2)}
                      </td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{svc.turnaroundDays}d</td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{svc._count.orderItems}</td>

                      <td className="px-5 py-3">
                        <ToggleSwitch id={svc.id} checked={svc.isActive} action={toggleServiceActive} />
                      </td>
                      <td className="px-5 py-3">
                        <ToggleSwitch id={svc.id} checked={svc.isFeatured} action={toggleServiceFeatured} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
