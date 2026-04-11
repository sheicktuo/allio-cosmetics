"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { getPusherClient } from "@/lib/pusher"

type Notif = {
  id: string
  orderNumber: string
  status: string
  message: string
  at: Date
  read: boolean
}

const STATUS_MESSAGES: Record<string, string> = {
  CONFIRMED:      "Your order has been confirmed!",
  RECEIVED:       "We've received your bottle",
  ASSESSING:      "Fragrance assessment in progress",
  RECONDITIONING: "Reconditioning has started",
  QUALITY_CHECK:  "Final quality check underway",
  READY:          "Your bottle is ready!",
  DELIVERED:      "Your bottle has been returned — enjoy!",
  CANCELLED:      "Your order was cancelled",
}

export default function NotificationsBell() {
  const { data: session } = useSession()
  const router = useRouter()
  const user = session?.user

  const [notifs, setNotifs] = useState<Notif[]>([])
  const [open, setOpen] = useState(false)

  const unread = notifs.filter((n) => !n.read).length

  // Subscribe to Pusher when user is logged in
  useEffect(() => {
    if (!user?.id) return
    const pusher = getPusherClient()
    const channel = pusher.subscribe(`user-${user.id}`)
    channel.bind("order-status", (data: { orderNumber: string; status: string }) => {
      const message = STATUS_MESSAGES[data.status] ?? `Order status updated`
      setNotifs((prev) => [
        {
          id: `${data.orderNumber}-${data.status}`,
          orderNumber: data.orderNumber,
          status: data.status,
          message,
          at: new Date(),
          read: false,
        },
        ...prev.slice(0, 19),
      ])
    })
    return () => {
      channel.unbind_all()
      pusher.unsubscribe(`user-${user.id}`)
    }
  }, [user?.id])

  function markAllRead() {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  if (!user) return null

  return (
    <div className="relative">
      {/* Bell trigger */}
      <button
        onClick={() => { setOpen((v) => !v); markAllRead() }}
        className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[1.1rem] h-[1.1rem] text-[10px] font-bold bg-primary text-primary-foreground rounded-full flex items-center justify-center leading-none px-1 animate-pulse">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div className="absolute right-0 top-11 z-50 w-80 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <p className="text-sm font-heading font-bold text-foreground">Notifications</p>
              {notifs.length > 0 && (
                <button
                  onClick={() => setNotifs([])}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-72 overflow-y-auto">
              {notifs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                  <svg className="w-8 h-8 text-muted-foreground/30 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <p className="text-sm font-medium text-muted-foreground">No notifications yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Order updates will appear here</p>
                </div>
              ) : (
                notifs.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      setOpen(false)
                      router.push(`/track?order=${n.orderNumber}`)
                    }}
                    className="w-full flex items-start gap-3 px-4 py-3.5 text-left hover:bg-muted transition-colors border-b border-border last:border-0"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      n.status === "CANCELLED" ? "bg-destructive/10" : "bg-primary/10"
                    }`}>
                      <svg className={`w-4 h-4 ${n.status === "CANCELLED" ? "text-destructive" : "text-primary"}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground">Order {n.orderNumber}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        {n.at.toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
