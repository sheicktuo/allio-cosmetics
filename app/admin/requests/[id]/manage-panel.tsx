"use client"

import { useState, useTransition } from "react"
import { updateRequestStatus, updateAdminNotes } from "./actions"
import { RequestStatus } from "@prisma/client"

const STATUSES: { value: RequestStatus; label: string }[] = [
  { value: "NEW",       label: "New"       },
  { value: "REVIEWING", label: "Reviewing" },
  { value: "QUOTED",    label: "Quoted"    },
  { value: "ACCEPTED",  label: "Accepted"  },
  { value: "REJECTED",  label: "Rejected"  },
  { value: "COMPLETED", label: "Completed" },
]

const inputCls =
  "w-full px-3 py-2.5 text-sm border border-border rounded-xl bg-transparent text-foreground " +
  "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors"

export default function ManagePanel({
  requestId,
  currentStatus,
  adminNotes:   initialNotes,
  customerEmail,
  customerName,
  subject,
}: {
  requestId:     string
  currentStatus: RequestStatus
  adminNotes:    string
  customerEmail: string
  customerName:  string
  subject:       string
}) {
  const [status,     setStatus]     = useState<RequestStatus>(currentStatus)
  const [notes,      setNotes]      = useState(initialNotes)
  const [notesSaved, setNotesSaved] = useState(false)
  const [isPending,  startTransition] = useTransition()

  function handleStatus(next: RequestStatus) {
    if (next === status) return
    setStatus(next)
    startTransition(async () => {
      await updateRequestStatus(requestId, next)
    })
  }

  function handleSaveNotes() {
    setNotesSaved(false)
    startTransition(async () => {
      await updateAdminNotes(requestId, notes)
      setNotesSaved(true)
      setTimeout(() => setNotesSaved(false), 2500)
    })
  }

  return (
    <div className="space-y-5">

      {/* ── Status picker ───────────────────────────────────────────────── */}
      <div className="bg-card rounded-xl border border-border p-5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          Status
        </p>
        <div className="space-y-1.5">
          {STATUSES.map((s) => {
            const active = status === s.value
            return (
              <button
                key={s.value}
                onClick={() => handleStatus(s.value)}
                disabled={isPending}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors
                  flex items-center justify-between gap-2 ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.label}
                {active && (
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Internal notes ──────────────────────────────────────────────── */}
      <div className="bg-card rounded-xl border border-border p-5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Internal Notes
        </p>
        <textarea
          className={`${inputCls} resize-none mb-3`}
          rows={5}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Private notes about this request — visible only to admins…"
        />
        <button
          onClick={handleSaveNotes}
          disabled={isPending}
          className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold
                     hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {notesSaved ? "Saved ✓" : isPending ? "Saving…" : "Save Notes"}
        </button>
      </div>

      {/* ── Quick reply ─────────────────────────────────────────────────── */}
      <div className="bg-card rounded-xl border border-border p-5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Quick Reply
        </p>
        <a
          href={`mailto:${customerEmail}?subject=Re: Your request — ${encodeURIComponent(subject)}`}
          className="flex items-center gap-2.5 w-full py-2.5 px-4 rounded-xl border border-border
                     text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          <svg className="w-4 h-4 text-muted-foreground shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Email {customerName.split(" ")[0]}
        </a>
      </div>

    </div>
  )
}
