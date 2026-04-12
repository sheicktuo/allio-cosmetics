"use client"

import { useEffect, useActionState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { forgotPasswordAction } from "./actions"

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, undefined)

  useEffect(() => {
    if (!state) return
    if ("error" in state) toast.error(state.error)
  }, [state])

  const sent = state && "success" in state

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
            Forgot your<br />
            <span className="text-primary">password?</span>
          </p>
          <p className="text-background/60 leading-relaxed max-w-sm">
            No worries. Enter your email and we&apos;ll send you a secure link to set a new one.
          </p>
        </div>

        <div className="relative flex gap-10">
          {[
            { value: "1 hr",    label: "Link validity" },
            { value: "Secure",  label: "Token hashed" },
            { value: "Instant", label: "Email delivery" },
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
          {sent ? (
            /* ── Success state ── */
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Check your email</h1>
              <p className="text-muted-foreground mb-8">
                If an account exists for that address, we&apos;ve sent a password reset link.
                The link expires in 1 hour.
              </p>
              <Link
                href="/login"
                className="w-full block text-center bg-primary text-primary-foreground font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-heading font-bold text-foreground">Reset password</h1>
                <p className="text-muted-foreground mt-1.5">
                  Enter your email and we&apos;ll send you a reset link
                </p>
              </div>

              <form action={formAction} className="space-y-5">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
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
                      Sending…
                    </>
                  ) : "Send Reset Link"}
                </button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Remember it?{" "}
                <Link href="/login" className="text-primary font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
