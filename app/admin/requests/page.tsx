import { prisma }   from "@/lib/prisma"
import { auth }     from "@/lib/auth"
import { redirect } from "next/navigation"
import Link         from "next/link"

export const dynamic  = "force-dynamic"
export const metadata = { title: "Perfume Requests — Admin" }

const STATUS_BADGE: Record<string, string> = {
  NEW:       "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  REVIEWING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  QUOTED:    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  ACCEPTED:  "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  REJECTED:  "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  COMPLETED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
}

const FILTERS = ["ALL", "NEW", "REVIEWING", "QUOTED", "ACCEPTED", "REJECTED", "COMPLETED"]

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  const session = await auth()
  if (!session?.user || !["ADMIN", "SUPERADMIN"].includes(session.user.role)) redirect("/admin")

  const sp     = await searchParams
  const filter = sp.status?.toUpperCase()
  const page   = Math.max(1, parseInt(sp.page ?? "1"))
  const PER    = 20

  const where =
    filter && filter !== "ALL"
      ? { status: filter as never }
      : {}

  const [requests, total, counts] = await Promise.all([
    prisma.customRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip:    (page - 1) * PER,
      take:    PER,
      include: { items: true },
    }),
    prisma.customRequest.count({ where }),
    prisma.customRequest.groupBy({ by: ["status"], _count: { id: true } }),
  ])

  const countMap: Record<string, number> = {}
  for (const c of counts) countMap[c.status] = c._count.id
  const totalAll   = counts.reduce((s, c) => s + c._count.id, 0)
  const totalPages = Math.ceil(total / PER)

  const newCount = countMap["NEW"] ?? 0

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
            Perfume Requests
            {newCount > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {newCount} new
              </span>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {totalAll} total request{totalAll !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => {
          const count  = f === "ALL" ? totalAll : (countMap[f] ?? 0)
          const active = (filter ?? "ALL") === f
          const href   =
            f === "ALL"
              ? "/admin/requests"
              : `/admin/requests?status=${f.toLowerCase()}`
          return (
            <Link
              key={f}
              href={href}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
              {count > 0 && ` (${count})`}
            </Link>
          )
        })}
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide bg-muted/50">
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Perfumes</th>
              <th className="px-5 py-3">Items</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {requests.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-14 text-center text-muted-foreground text-sm">
                  No requests yet
                </td>
              </tr>
            )}
            {requests.map((r) => {
              const first   = r.items[0]
              const summary = first
                ? `${first.brand} — ${first.perfumeName}`
                : "—"
              const extra = r.items.length > 1 ? ` + ${r.items.length - 1} more` : ""

              return (
                <tr key={r.id} className="hover:bg-muted/30 transition-colors">

                  <td className="px-5 py-3.5">
                    <p className="text-sm font-medium text-foreground">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.email}</p>
                  </td>

                  <td className="px-5 py-3.5 max-w-[280px]">
                    <Link
                      href={`/admin/requests/${r.id}`}
                      className="text-sm font-medium text-foreground hover:text-primary transition-colors line-clamp-1"
                    >
                      {summary}{extra}
                    </Link>
                    {r.notes && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{r.notes}</p>
                    )}
                  </td>

                  <td className="px-5 py-3.5 text-sm text-muted-foreground tabular-nums">
                    {r.items.length}
                  </td>

                  <td className="px-5 py-3.5">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold ${STATUS_BADGE[r.status]}`}>
                      {r.status.charAt(0) + r.status.slice(1).toLowerCase()}
                    </span>
                  </td>

                  <td className="px-5 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(r.createdAt).toLocaleDateString("en-CA", {
                      month: "short", day: "numeric", year: "numeric",
                    })}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-border flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/requests?${filter ? `status=${filter.toLowerCase()}&` : ""}page=${page - 1}`}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-muted hover:bg-muted/70 text-foreground transition-colors"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/requests?${filter ? `status=${filter.toLowerCase()}&` : ""}page=${page + 1}`}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-muted hover:bg-muted/70 text-foreground transition-colors"
                >
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
