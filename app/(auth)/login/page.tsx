import Link from "next/link"
import PasswordInput from "@/components/ui/password-input"
import { loginAction } from "./actions"

export const metadata = { title: "Sign In — Allio Cosmetics" }

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; from?: string }
}) {
  const errorMap: Record<string, string> = {
    CredentialsSignin: "Invalid email or password.",
    MissingCSRF: "Session expired. Please try again.",
  }
  const error = searchParams.error ? (errorMap[searchParams.error] ?? "Something went wrong.") : null

  return (
    <div className="min-h-screen bg-background flex">

      {/* ── Left decorative panel ─────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 bg-foreground flex-col justify-between p-14 relative overflow-hidden">
        {/* Gold glow orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary rounded-full opacity-10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-primary rounded-full opacity-10 blur-3xl pointer-events-none" />

        {/* Logo */}
        <Link href="/" className="relative flex items-center gap-2.5">
          <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground font-bold font-heading">A</span>
          </div>
          <span className="text-xl font-bold font-heading tracking-wide text-background">
            Allio <span className="text-primary">Cosmetics</span>
          </span>
        </Link>

        {/* Quote */}
        <div className="relative space-y-6">
          <p className="text-5xl font-heading font-bold text-background leading-[1.15]">
            The finest fragrances<br />
            <span className="text-primary">deserve a second life.</span>
          </p>
          <p className="text-background/60 leading-relaxed max-w-sm">
            Sign in to track your orders, manage your bottles, and access your Allio account.
          </p>
        </div>

        {/* Bottom stats */}
        <div className="relative flex gap-10">
          {[
            { value: "500+", label: "Bottles restored" },
            { value: "4.9★", label: "Customer rating" },
            { value: "5 days", label: "Avg. turnaround" },
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

        {/* Mobile logo */}
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
            <h1 className="text-3xl font-heading font-bold text-foreground">Welcome back</h1>
            <p className="text-muted-foreground mt-1.5">Sign in to your account to continue</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <form action={loginAction} className="space-y-5">
            {searchParams.from && (
              <input type="hidden" name="from" value={searchParams.from} />
            )}
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

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                id="password"
                name="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 mt-2"
            >
              Sign In
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary font-semibold hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
