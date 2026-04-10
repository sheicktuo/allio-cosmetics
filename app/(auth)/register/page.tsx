import Link from "next/link"

export const metadata = { title: "Create Account — Allio Cosmetics" }

export default function RegisterPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const error = searchParams.error === "EmailTaken"
    ? "An account with that email already exists."
    : searchParams.error
      ? "Something went wrong. Please try again."
      : null

  return (
    <div className="min-h-screen bg-background flex">

      {/* ── Left decorative panel ─────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 bg-foreground flex-col justify-between p-14 relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary rounded-full opacity-10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-primary rounded-full opacity-10 blur-3xl pointer-events-none" />

        <Link href="/" className="relative flex items-center gap-2.5">
          <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground font-bold font-heading">A</span>
          </div>
          <span className="text-xl font-bold font-heading tracking-wide text-background">
            Allio <span className="text-primary">Cosmetics</span>
          </span>
        </Link>

        <div className="relative space-y-6">
          <p className="text-5xl font-heading font-bold text-background leading-[1.15]">
            Join Allio.<br />
            <span className="text-primary">Restore what you love.</span>
          </p>
          <p className="text-background/60 leading-relaxed max-w-sm">
            Create a free account to book services, track your bottles, and receive exclusive member offers.
          </p>
        </div>

        <div className="relative flex gap-10">
          {[
            { value: "Free", label: "To register" },
            { value: "Live", label: "Order tracking" },
            { value: "Priority", label: "Member booking" },
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
            <h1 className="text-3xl font-heading font-bold text-foreground">Create your account</h1>
            <p className="text-muted-foreground mt-1.5">Track orders and save your details</p>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <form action="/api/auth/register" method="POST" className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-medium text-foreground">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                autoComplete="name"
                placeholder="Amélie Fontenay"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
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
              <label htmlFor="phone" className="text-sm font-medium text-foreground">
                Phone <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+44 7700 900000"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Min. 8 characters"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 mt-2"
            >
              Create Account
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
