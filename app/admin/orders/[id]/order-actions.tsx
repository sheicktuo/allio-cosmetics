"use client"

import { useTransition, useActionState, useEffect } from "react"
import { toast } from "sonner"
import { advanceOrderStatus, setOrderStatus, saveOrderNotes } from "./actions"

const STATUS_FLOW = [
  "PENDING", "CONFIRMED", "RECEIVED", "ASSESSING",
  "RECONDITIONING", "QUALITY_CHECK", "READY", "DELIVERED",
]
const ALL_STATUSES = [...STATUS_FLOW, "CANCELLED", "REFUNDED"]

const inputCls = "w-full px-3 py-2 text-sm border border-border rounded-lg bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"

type Props = {
  orderId:          string
  currentStatus:    string
  staffNotes:       string | null
  assessmentNotes:  string | null
}

export default function OrderActions({ orderId, currentStatus, staffNotes, assessmentNotes }: Props) {
  const [advancing, startAdvance] = useTransition()
  const canAdvance = STATUS_FLOW.indexOf(currentStatus) !== -1 && STATUS_FLOW.indexOf(currentStatus) < STATUS_FLOW.length - 1
  const nextStatus = canAdvance ? STATUS_FLOW[STATUS_FLOW.indexOf(currentStatus) + 1] : null

  function handleAdvance() {
    startAdvance(async () => {
      const res = await advanceOrderStatus(orderId)
      if (res.error) toast.error(res.error)
      else toast.success(`Status advanced to ${res.status}`)
    })
  }

  // Manual status override
  const [setting, startSet] = useTransition()
  function handleSetStatus(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const status = fd.get("status") as string
    const note   = fd.get("note") as string
    startSet(async () => {
      const res = await setOrderStatus(orderId, status, note || undefined)
      if (res.error) toast.error(res.error)
      else toast.success("Status updated.")
    })
  }

  // Notes
  const [notesState, notesAction, notesPending] = useActionState(saveOrderNotes, undefined)
  useEffect(() => {
    if (!notesState) return
    if (notesState.success) toast.success("Notes saved.")
  }, [notesState])

  return (
    <div className="space-y-4">
      {/* Advance button */}
      {canAdvance && (
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Next Step</p>
          <button
            onClick={handleAdvance}
            disabled={advancing}
            className="w-full bg-primary text-primary-foreground text-sm font-semibold py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {advancing ? "Updating…" : `Advance → ${nextStatus?.replace("_", " ")}`}
          </button>
        </div>
      )}

      {/* Manual override */}
      <div className="bg-card border border-border rounded-xl p-5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Set Status Manually</p>
        <form onSubmit={handleSetStatus} className="space-y-3">
          <select name="status" defaultValue={currentStatus} className={`${inputCls} bg-background`}>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>{s.replace("_", " ")}</option>
            ))}
          </select>
          <input name="note" placeholder="Internal note (optional)" className={inputCls} />
          <button
            type="submit"
            disabled={setting}
            className="w-full border border-border text-foreground text-sm font-medium py-2 rounded-xl hover:bg-muted transition-colors disabled:opacity-60"
          >
            {setting ? "Saving…" : "Update Status"}
          </button>
        </form>
      </div>

      {/* Notes */}
      <div className="bg-card border border-border rounded-xl p-5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Internal Notes</p>
        <form action={notesAction} className="space-y-3">
          <input type="hidden" name="orderId" value={orderId} />
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Staff Notes</label>
            <textarea
              name="staffNotes"
              rows={3}
              defaultValue={staffNotes ?? ""}
              placeholder="Notes visible to staff only…"
              className={`${inputCls} resize-none`}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Assessment Notes</label>
            <textarea
              name="assessmentNotes"
              rows={3}
              defaultValue={assessmentNotes ?? ""}
              placeholder="Fragrance assessment observations…"
              className={`${inputCls} resize-none`}
            />
          </div>
          <button
            type="submit"
            disabled={notesPending}
            className="w-full border border-border text-foreground text-sm font-medium py-2 rounded-xl hover:bg-muted transition-colors disabled:opacity-60"
          >
            {notesPending ? "Saving…" : "Save Notes"}
          </button>
        </form>
      </div>
    </div>
  )
}
