"use client"

import { useState, useTransition } from "react"
import { createAdmin }             from "./actions"

const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground " +
  "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 " +
  "focus:border-primary transition-colors text-sm"

export default function CreateAdminForm({ onCreated }: { onCreated: () => void }) {
  const [name,     setName]     = useState("")
  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")
  const [showPw,   setShowPw]   = useState(false)
  const [error,    setError]    = useState("")

  const [isPending, startTransition] = useTransition()

  const canSubmit = name.trim() && email.trim() && password.length >= 8

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setError("")
    startTransition(async () => {
      const res = await createAdmin({ name, email, password })
      if (res.success) {
        setName("")
        setEmail("")
        setPassword("")
        onCreated()
      } else {
        setError(res.error ?? "Something went wrong.")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div role="alert" className="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Name */}
      <div>
        <label htmlFor="admin-name" className="block text-sm font-medium text-foreground mb-1.5">
          Full Name <span className="text-destructive" aria-hidden="true">*</span>
        </label>
        <input
          id="admin-name"
          className={inputCls}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Sarah Dupont"
          autoComplete="off"
          required
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="admin-email" className="block text-sm font-medium text-foreground mb-1.5">
          Email Address <span className="text-destructive" aria-hidden="true">*</span>
        </label>
        <input
          id="admin-email"
          className={inputCls}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@example.com"
          autoComplete="off"
          required
        />
      </div>

      {/* Password */}
      <div>
        <label htmlFor="admin-pw" className="block text-sm font-medium text-foreground mb-1.5">
          Initial Password <span className="text-destructive" aria-hidden="true">*</span>
        </label>
        <div className="relative">
          <input
            id="admin-pw"
            className={inputCls}
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPw ? "Hide password" : "Show password"}
          >
            {showPw ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">
          This will be emailed to the new admin. They should change it after first sign-in.
        </p>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3 pt-1">
        <button
          type="submit"
          disabled={isPending || !canSubmit}
          className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold
                     hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors flex items-center gap-2"
        >
          {isPending ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating…
            </>
          ) : (
            "Create Admin"
          )}
        </button>
      </div>
    </form>
  )
}
