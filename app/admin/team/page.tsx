"use client"

import { useEffect, useState, useTransition } from "react"
import CreateAdminForm from "./create-admin-form"

// ── Types ─────────────────────────────────────────────────────────────────────

type AdminUser = {
  id:        string
  name:      string | null
  email:     string
  role:      "ADMIN" | "SUPERADMIN"
  createdAt: string
}

// ── Fetch helper (client-safe via API route) ──────────────────────────────────

async function fetchAdmins(): Promise<AdminUser[]> {
  const res = await fetch("/api/admin/team")
  if (!res.ok) return []
  return res.json()
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TeamPage() {
  const [admins,    setAdmins]    = useState<AdminUser[]>([])
  const [loading,   setLoading]   = useState(true)
  const [showForm,  setShowForm]  = useState(false)
  const [succeeded, setSucceeded] = useState(false)
  const [,          startTransition] = useTransition()

  function load() {
    setLoading(true)
    fetchAdmins().then((data) => {
      setAdmins(data)
      setLoading(false)
    })
  }

  useEffect(() => { load() }, [])

  function handleCreated() {
    setShowForm(false)
    setSucceeded(true)
    startTransition(() => { load() })
    setTimeout(() => setSucceeded(false), 4000)
  }

  const roleBadge = (role: AdminUser["role"]) =>
    role === "SUPERADMIN"
      ? "bg-primary/15 text-primary"
      : "bg-muted text-muted-foreground"

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Team</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage admin accounts. Admins have full access to the dashboard.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => { setShowForm(true); setSucceeded(false) }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground
                       text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Admin
          </button>
        )}
      </div>

      {/* Success banner */}
      {succeeded && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Admin created — login details have been sent to their email.
        </div>
      )}

      {/* Create form panel */}
      {showForm && (
        <div className="mb-6 bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-foreground">New Admin</h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <CreateAdminForm onCreated={handleCreated} />
        </div>
      )}

      {/* Admins table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide bg-muted/50">
                <th className="px-5 py-3">Admin</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-muted-foreground text-sm">
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && admins.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-muted-foreground text-sm">
                    No admin accounts found.
                  </td>
                </tr>
              )}
              {admins.map((admin) => {
                const initials = (admin.name ?? admin.email)[0].toUpperCase()
                return (
                  <tr key={admin.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                          {initials}
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {admin.name ?? "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">
                      {admin.email}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${roleBadge(admin.role)}`}>
                        {admin.role === "SUPERADMIN" ? "Super Admin" : "Admin"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">
                      {new Date(admin.createdAt).toLocaleDateString("en-CA")}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
