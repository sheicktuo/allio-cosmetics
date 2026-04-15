import { prisma }       from "@/lib/prisma"
import { auth }         from "@/lib/auth"
import { notFound, redirect } from "next/navigation"
import Link             from "next/link"
import ManagePanel      from "./manage-panel"

export const dynamic  = "force-dynamic"

const STATUS_BADGE: Record<string, string> = {
  NEW:       "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  REVIEWING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  QUOTED:    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  ACCEPTED:  "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  REJECTED:  "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  COMPLETED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
}

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user || !["ADMIN", "SUPERADMIN"].includes(session.user.role)) redirect("/admin")

  const { id } = await params
  const request = await prisma.customRequest.findUnique({
    where:   { id },
    include: { user: { select: { id: true, name: true, email: true } } },
  })
  if (!request) notFound()

  return (
    <div>
      {/* Back */}
      <div className="mb-6">
        <Link
          href="/admin/requests"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          All Requests
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground leading-tight">{request.subject}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Submitted{" "}
            {new Date(request.createdAt).toLocaleDateString("en-CA", {
              month: "long", day: "numeric", year: "numeric",
            })}
            {request.productType && (
              <> &middot; <span className="text-foreground">{request.productType}</span></>
            )}
          </p>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 ${STATUS_BADGE[request.status]}`}>
          {request.status.charAt(0) + request.status.slice(1).toLowerCase()}
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* ── Left: details ─────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Request details */}
          <div className="bg-card rounded-xl border border-border p-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-5">
              Request Details
            </p>
            <div className="space-y-5">
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Description</p>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {request.description}
                </p>
              </div>
              {request.inspiration && (
                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-1.5">Inspiration / References</p>
                  <p className="text-sm text-foreground">{request.inspiration}</p>
                </div>
              )}
              {request.budget && (
                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-1.5">Budget Range</p>
                  <p className="text-sm font-semibold text-foreground">{request.budget}</p>
                </div>
              )}
            </div>
          </div>

          {/* Customer info */}
          <div className="bg-card rounded-xl border border-border p-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-5">
              Customer Info
            </p>
            <div className="grid sm:grid-cols-3 gap-5">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Name</p>
                <p className="text-sm font-medium text-foreground">{request.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Email</p>
                <a
                  href={`mailto:${request.email}`}
                  className="text-sm text-primary hover:underline"
                >
                  {request.email}
                </a>
              </div>
              {request.phone && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Phone</p>
                  <p className="text-sm text-foreground">{request.phone}</p>
                </div>
              )}
            </div>
            {request.user && (
              <div className="mt-5 pt-5 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">Registered Account</p>
                <Link
                  href={`/admin/customers`}
                  className="text-sm text-primary hover:underline"
                >
                  View customer profile →
                </Link>
              </div>
            )}
          </div>

        </div>

        {/* ── Right: manage panel ───────────────────────────────────────── */}
        <div>
          <ManagePanel
            requestId={id}
            currentStatus={request.status}
            adminNotes={request.adminNotes ?? ""}
            customerEmail={request.email}
            customerName={request.name}
            subject={request.subject}
          />
        </div>

      </div>
    </div>
  )
}
