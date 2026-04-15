"use client"

import { useState, useTransition } from "react"
import { submitRequest }            from "./actions"

const inputCls =
  "w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground " +
  "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 " +
  "focus:border-primary transition-colors text-sm"

const PRODUCT_TYPES = ["Skincare", "Hair Care", "Fragrance", "Makeup", "Body Care", "Other"]
const BUDGET_RANGES = [
  "Under CA$50",
  "CA$50 – CA$100",
  "CA$100 – CA$200",
  "CA$200 – CA$500",
  "CA$500+",
  "Not sure yet",
]

export default function RequestForm({
  defaultName,
  defaultEmail,
}: {
  defaultName:  string
  defaultEmail: string
}) {
  const [name,        setName]        = useState(defaultName)
  const [email,       setEmail]       = useState(defaultEmail)
  const [phone,       setPhone]       = useState("")
  const [productType, setProductType] = useState("")
  const [subject,     setSubject]     = useState("")
  const [description, setDescription] = useState("")
  const [budget,      setBudget]      = useState("")
  const [inspiration, setInspiration] = useState("")

  const [isPending, startTransition] = useTransition()
  const [submitted,  setSubmitted]   = useState(false)
  const [error,      setError]       = useState("")

  const canSubmit = name.trim() && email.trim() && subject.trim() && description.trim()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setError("")
    startTransition(async () => {
      const res = await submitRequest({ name, email, phone, productType, subject, description, budget, inspiration })
      if (res.success) setSubmitted(true)
      else setError(res.error ?? "Something went wrong. Please try again.")
    })
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="text-center py-16 px-8 bg-primary/5 border border-primary/20 rounded-2xl">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold font-heading text-foreground mb-3">Request Sent!</h2>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
          Thank you, <span className="font-semibold text-foreground">{name.split(" ")[0]}</span>.
          We&apos;ve received your request and will get back to you within 48 hours.
          Check your inbox for a confirmation email.
        </p>
      </div>
    )
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Name + Email */}
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Name <span className="text-destructive">*</span>
          </label>
          <input
            className={inputCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Email <span className="text-destructive">*</span>
          </label>
          <input
            className={inputCls}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />
        </div>
      </div>

      {/* Phone + Product Type */}
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Phone{" "}
            <span className="text-muted-foreground text-xs font-normal">(optional)</span>
          </label>
          <input
            className={inputCls}
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (000) 000-0000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Product Category{" "}
            <span className="text-muted-foreground text-xs font-normal">(optional)</span>
          </label>
          <select
            className={inputCls}
            value={productType}
            onChange={(e) => setProductType(e.target.value)}
          >
            <option value="">Select a category…</option>
            {PRODUCT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Subject */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Request Title <span className="text-destructive">*</span>
        </label>
        <input
          className={inputCls}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. Custom rose water toner with SPF 30"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Description <span className="text-destructive">*</span>
          <span className="text-muted-foreground text-xs font-normal ml-1">
            — the more detail, the better
          </span>
        </label>
        <textarea
          className={`${inputCls} resize-none`}
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what you're looking for: ingredients, scent, texture, skin type, packaging preferences, quantity, any specific needs or sensitivities…"
          required
        />
        <p className="text-xs text-muted-foreground mt-1.5">{description.length} characters</p>
      </div>

      {/* Budget + Inspiration */}
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Budget Range{" "}
            <span className="text-muted-foreground text-xs font-normal">(optional)</span>
          </label>
          <select
            className={inputCls}
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          >
            <option value="">Select a range…</option>
            {BUDGET_RANGES.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Inspiration / References{" "}
            <span className="text-muted-foreground text-xs font-normal">(optional)</span>
          </label>
          <input
            className={inputCls}
            value={inspiration}
            onChange={(e) => setInspiration(e.target.value)}
            placeholder="Links, product names, mood words…"
          />
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending || !canSubmit}
        className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm
                   tracking-wide hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors flex items-center justify-center gap-2 mt-2"
      >
        {isPending ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Sending…
          </>
        ) : (
          "Send Request"
        )}
      </button>

      <p className="text-xs text-muted-foreground text-center">
        We typically respond within 48 hours. No commitment required.
      </p>
    </form>
  )
}
