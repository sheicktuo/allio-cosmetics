"use client"

import { useState } from "react"
import { updateProfile, updatePassword } from "./actions"
import PasswordInput from "@/components/ui/password-input"

type User = { name?: string | null; email?: string | null; phone?: string | null }

const inputCls = "w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-sm"

function StatusBanner({ state }: { state: { success?: boolean; error?: string } | null }) {
  if (!state) return null
  if (state.success) return (
    <div className="px-4 py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm">
      Changes saved successfully.
    </div>
  )
  return (
    <div className="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
      {state.error}
    </div>
  )
}

export default function SettingsForm({ user }: { user: User | null }) {
  const [profileState, setProfileState] = useState<{ success?: boolean; error?: string } | null>(null)
  const [passwordState, setPasswordState] = useState<{ success?: boolean; error?: string } | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  async function handleProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setProfileLoading(true)
    setProfileState(null)
    const result = await updateProfile(new FormData(e.currentTarget))
    setProfileState(result ?? null)
    setProfileLoading(false)
  }

  async function handlePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPasswordLoading(true)
    setPasswordState(null)
    const result = await updatePassword(new FormData(e.currentTarget))
    setPasswordState(result ?? null)
    if (result?.success) (e.target as HTMLFormElement).reset()
    setPasswordLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Profile details */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-heading font-bold text-foreground mb-5">Personal Details</h2>
        <form onSubmit={handleProfile} className="space-y-4">
          <StatusBanner state={profileState} />

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Full Name</label>
            <input
              name="name"
              defaultValue={user?.name ?? ""}
              required
              placeholder="Your full name"
              className={inputCls}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Email</label>
            <input
              value={user?.email ?? ""}
              disabled
              className={`${inputCls} opacity-50 cursor-not-allowed`}
            />
            <p className="text-xs text-muted-foreground">Email cannot be changed. Contact support if needed.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Phone <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <input
              name="phone"
              type="tel"
              defaultValue={user?.phone ?? ""}
              placeholder="+44 7700 900000"
              className={inputCls}
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={profileLoading}
              className="bg-primary text-primary-foreground text-sm font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              {profileLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Saving…
                </>
              ) : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Change password */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-heading font-bold text-foreground mb-1">Change Password</h2>
        <p className="text-sm text-muted-foreground mb-5">Leave blank if you don&apos;t want to change it.</p>

        <form onSubmit={handlePassword} className="space-y-4">
          <StatusBanner state={passwordState} />

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Current Password</label>
            <PasswordInput name="currentPassword" required placeholder="Your current password" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">New Password</label>
            <PasswordInput name="newPassword" required minLength={8} placeholder="Min. 8 characters" />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={passwordLoading}
              className="bg-primary text-primary-foreground text-sm font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              {passwordLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Updating…
                </>
              ) : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
