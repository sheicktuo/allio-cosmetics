import { prisma } from "@/lib/prisma"
import Link from "next/link"

export const metadata = { title: "Customers — Admin" }

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>
}) {
  const { page: pageParam, q } = await searchParams
  const page    = parseInt(pageParam ?? "1")
  const perPage = 25

  const where = {
    role: "CUSTOMER" as const,
    ...(q ? {
      OR: [
        { name:  { contains: q, mode: "insensitive" as const } },
        { email: { contains: q, mode: "insensitive" as const } },
      ],
    } : {}),
  }

  const [customers, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take:    perPage,
      skip:    (page - 1) * perPage,
      include: {
        _count:  { select: { orders: true } },
        orders:  { where: { paymentStatus: "PAID" }, select: { total: true } },
      },
    }),
    prisma.user.count({ where }),
  ])

  const buildHref = (p: number) => {
    const params = new URLSearchParams()
    if (q)    params.set("q", q)
    if (p > 1) params.set("page", String(p))
    const qs = params.toString()
    return `/admin/customers${qs ? `?${qs}` : ""}`
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Customers</h1>
        <span className="text-sm text-muted-foreground">{total} total</span>
      </div>

      {/* Search */}
      <form method="GET" className="mb-5">
        <div className="relative max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name or email…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </form>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide bg-muted/50">
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Orders</th>
                <th className="px-5 py-3">Total Spent</th>
                <th className="px-5 py-3">Member Since</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {customers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">
                    {q ? `No customers matching "${q}"` : "No customers yet"}
                  </td>
                </tr>
              )}
              {customers.map((c) => {
                const totalSpent = c.orders.reduce((s, o) => s + o.total, 0)
                const initials   = (c.name ?? c.email ?? "?")[0].toUpperCase()
                return (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                          {initials}
                        </div>
                        <span className="text-sm font-medium text-foreground">{c.name ?? "—"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{c.email}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{c.phone ?? "—"}</td>
                    <td className="px-5 py-3 text-sm font-semibold text-foreground">{c._count.orders}</td>
                    <td className="px-5 py-3 text-sm font-medium text-foreground">
                      CA${(totalSpent / 100).toFixed(2)}
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">
                      {new Date(c.createdAt).toLocaleDateString("en-CA")}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {total > perPage && (
          <div className="p-4 border-t border-border flex justify-between items-center text-sm text-muted-foreground">
            <span>Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}</span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={buildHref(page - 1)} className="px-3 py-1.5 border border-border rounded-lg hover:bg-muted transition-colors">
                  Previous
                </Link>
              )}
              {page * perPage < total && (
                <Link href={buildHref(page + 1)} className="px-3 py-1.5 border border-border rounded-lg hover:bg-muted transition-colors">
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
