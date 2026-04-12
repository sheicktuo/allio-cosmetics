"use client"

import { Suspense, useEffect, useActionState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import PasswordInput from "@/components/ui/password-input"
import { resetPasswordAction } from "./actions"

// Inner component — uses useSearchParams(), must be inside <Suspense>
function ResetPasswordForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const token        = searchParams.get("token") ?? ""

  const [state, formAction, pending] = useActionState(resetPasswordAction, undefined)

  useEffect(() => {
    if (!state) return
    if ("error" in state) {
      toast.error(state.error)
    } else if ("success" in state) {
      toast.success("Password updated! Please sign in.")
      router.push("/login")
    }
  // router is a stable singleton — intentionally excluded from deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  // No token in URL — show an error immediately
  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-heading font-bold text-foreground mb-2">Invalid link</h1>
          <p className="text-muted-foreground mb-6">
            This password reset link is missing or malformed.
          </p>
          <Link
            href="/forgot-password"
            className="inline-block bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
          >
            Request a new link
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">

      {/* ── Left decorative panel ─────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 bg-foreground flex-col justify-between p-14 relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary rounded-full opacity-10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-primary rounded-full opacity-10 blur-3xl pointer-events-none" />

        <Link href="/" className="relative flex items-center gap-2.5">
          <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center shrink-0">
            <span className="text-primary-foreground font-bold font-heading">A</span>
          </div>
          <span className="text-xl font-bold font-heading tracking-wide text-background">
            Allio <span className="text-primary">Cosmetics</span>
          </span>
        </Link>

        <div className="relative space-y-6">
          <p className="text-5xl font-heading font-bold text-background leading-[1.15]">
            Choose a new<br />
            <span className="text-primary">password.</span>
          </p>
          <p className="text-background/60 leading-relaxed max-w-sm">
            Pick something strong. We&apos;ll hash it securely and you&apos;ll be back in your account right away.
          </p>
        </div>

        <div className="relative flex gap-10">
          {[
            { value: "bcrypt", label: "12 rounds" },
            { value: "Once",   label: "Link use" },
            { value: "Instant", label: "Login after" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-primary font-heading font-bold text-xl">{s.value}</p>
              <p className="text-background/50 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">

        <Link href="/" className="flex items-center gap-2.5 mb-10 lg:hidden">
          <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground font-bold font-heading">A</span>
          </div>
          <span className="text-xl font-bold font-heading tracking-wide text-foreground">
            Allio <span className="text-primary">Cosmetics</span>
          </span>
        </Link>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-bold text-foreground">New password</h1>
            <p className="text-muted-foreground mt-1.5">Must be at least 8 characters</p>
          </div>

          <form action={formAction} className="space-y-5">
            {/* Pass token through the form */}
            <input type="hidden" name="token" value={token} />

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                New Password
              </label>
              <PasswordInput
                id="password"
                name="password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Min. 8 characters"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirm" className="text-sm font-medium text-foreground">
                Confirm Password
              </label>
              <PasswordInput
                id="confirm"
                name="confirm"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Repeat your password"
              />
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full bg-primary text-primary-foreground font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 mt-2 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {pending ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Updating…
                </>
              ) : "Set New Password"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Remembered it?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
