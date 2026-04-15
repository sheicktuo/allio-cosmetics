"use client"

import { useState } from "react"
import { updateProfile, updatePassword, addAddress, updateAddress, deleteAddress, setDefaultAddress } from "./actions"
import PasswordInput from "@/components/ui/password-input"
import AddressAutocomplete from "@/components/ui/address-autocomplete"

type User    = { name?: string | null; email?: string | null; phone?: string | null }
type Address = {
  id: string; label: string | null; line1: string; line2: string | null
  city: string; postcode: string; country: string; isDefault: boolean
}

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

const COUNTRIES = [
  { code: "CA", name: "Canada" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
]

function AddressForm({
  initial,
  onSave,
  onCancel,
  loading,
}: {
  initial?: Address | null
  onSave: (fd: FormData) => void
  onCancel: () => void
  loading: boolean
}) {
  // Controlled state for fields that autocomplete can populate
  const [line1,    setLine1]    = useState(initial?.line1    ?? "")
  const [city,     setCity]     = useState(initial?.city     ?? "")
  const [postcode, setPostcode] = useState(initial?.postcode ?? "")
  const [country,  setCountry]  = useState(initial?.country  ?? "CA")

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSave(new FormData(e.currentTarget)) }}
      className="space-y-3 pt-1"
    >
      {initial && <input type="hidden" name="id" value={initial.id} />}

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">
          Label <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <input name="label" defaultValue={initial?.label ?? ""} placeholder="Home, Work…" className={inputCls} />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">
          Address line 1 <span className="text-primary text-xs">*</span>
        </label>
        <AddressAutocomplete
          name="line1"
          required
          value={line1}
          onChange={setLine1}
          onSelect={(result) => {
            setLine1(result.line1)
            setCity(result.city)
            setPostcode(result.postcode)
            if (result.country) setCountry(result.country)
          }}
          placeholder="123 Main Street"
          className={inputCls}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">
          Address line 2 <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <input name="line2" defaultValue={initial?.line2 ?? ""} placeholder="Apt, suite, unit…" className={inputCls} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">City <span className="text-primary text-xs">*</span></label>
          <input name="city" required value={city} onChange={(e) => setCity(e.target.value)}
            placeholder="Toronto" className={inputCls} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Postcode <span className="text-primary text-xs">*</span></label>
          <input name="postcode" required value={postcode} onChange={(e) => setPostcode(e.target.value)}
            placeholder="M5V 2T6" className={inputCls} />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Country <span className="text-primary text-xs">*</span></label>
        <select name="country" value={country} onChange={(e) => setCountry(e.target.value)}
          className={`${inputCls} bg-background`}>
          {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
        </select>
      </div>

      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onCancel}
          className="px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Saving…
            </>
          ) : "Save Address"}
        </button>
      </div>
    </form>
  )
}

export default function SettingsForm({
  user,
  addresses: initialAddresses,
}: {
  user: User | null
  addresses: Address[]
}) {
  // ── Personal details ────────────────────────────────────────────
  const [profileState,   setProfileState]   = useState<{ success?: boolean; error?: string } | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)

  async function handleProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setProfileLoading(true)
    setProfileState(null)
    const result = await updateProfile(new FormData(e.currentTarget))
    setProfileState(result ?? null)
    setProfileLoading(false)
  }

  // ── Password ────────────────────────────────────────────────────
  const [passwordState,   setPasswordState]   = useState<{ success?: boolean; error?: string } | null>(null)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [showPasswordConfirm,  setShowPasswordConfirm]  = useState(false)
  const [pendingPasswordForm,  setPendingPasswordForm]  = useState<FormData | null>(null)

  async function handlePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPendingPasswordForm(new FormData(e.currentTarget))
    setShowPasswordConfirm(true)
  }

  async function confirmPasswordChange() {
    if (!pendingPasswordForm) return
    setPasswordLoading(true)
    setShowPasswordConfirm(false)
    setPasswordState(null)
    const result = await updatePassword(pendingPasswordForm)
    setPasswordState(result ?? null)
    if (result?.success) {
      const form = document.getElementById("password-form") as HTMLFormElement | null
      form?.reset()
    }
    setPendingPasswordForm(null)
    setPasswordLoading(false)
  }

  // ── Addresses ───────────────────────────────────────────────────
  const [addresses,    setAddresses]    = useState<Address[]>(initialAddresses)
  const [addrLoading,  setAddrLoading]  = useState(false)
  const [addrError,    setAddrError]    = useState<string | null>(null)
  const [showAddForm,  setShowAddForm]  = useState(false)
  const [editingId,    setEditingId]    = useState<string | null>(null)
  const [deletingId,   setDeletingId]   = useState<string | null>(null)

  async function handleAddAddress(fd: FormData) {
    setAddrLoading(true)
    setAddrError(null)
    const result = await addAddress(fd)
    if (result?.error) { setAddrError(result.error) }
    else {
      setShowAddForm(false)
      // Re-fetch by reloading — server already revalidated
      window.location.reload()
    }
    setAddrLoading(false)
  }

  async function handleUpdateAddress(fd: FormData) {
    setAddrLoading(true)
    setAddrError(null)
    const result = await updateAddress(fd)
    if (result?.error) { setAddrError(result.error) }
    else {
      setEditingId(null)
      window.location.reload()
    }
    setAddrLoading(false)
  }

  async function handleDeleteAddress(id: string) {
    setDeletingId(null)
    setAddrLoading(true)
    setAddrError(null)
    const result = await deleteAddress(id)
    if (result?.error) { setAddrError(result.error) }
    else { setAddresses((prev) => prev.filter((a) => a.id !== id)) }
    setAddrLoading(false)
  }

  async function handleSetDefault(id: string) {
    setAddrLoading(true)
    setAddrError(null)
    const result = await setDefaultAddress(id)
    if (result?.error) { setAddrError(result.error) }
    else {
      setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })))
    }
    setAddrLoading(false)
  }

  return (
    <div className="space-y-6">

      {/* ── Personal details ── */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-heading font-bold text-foreground mb-5">Personal Details</h2>
        <form onSubmit={handleProfile} className="space-y-4">
          <StatusBanner state={profileState} />

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Full Name</label>
            <input name="name" defaultValue={user?.name ?? ""} required placeholder="Your full name" className={inputCls} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Email</label>
            <input value={user?.email ?? ""} disabled className={`${inputCls} opacity-50 cursor-not-allowed`} />
            <p className="text-xs text-muted-foreground">Email cannot be changed. Contact support if needed.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Phone <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <input name="phone" type="tel" defaultValue={user?.phone ?? ""} placeholder="+44 7700 900000" className={inputCls} />
          </div>

          <div className="flex justify-end pt-1">
            <button type="submit" disabled={profileLoading}
              className="bg-primary text-primary-foreground text-sm font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2">
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

      {/* ── Saved addresses ── */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-heading font-bold text-foreground">Saved Addresses</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Used to pre-fill shipping at checkout</p>
          </div>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add address
            </button>
          )}
        </div>

        {addrError && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {addrError}
          </div>
        )}

        {/* Existing addresses */}
        {addresses.length > 0 && (
          <div className="space-y-3 mb-4">
            {addresses.map((addr) => (
              <div key={addr.id} className={`rounded-xl border p-4 transition-colors ${addr.isDefault ? "border-primary/40 bg-primary/3" : "border-border"}`}>
                {editingId === addr.id ? (
                  <AddressForm
                    initial={addr}
                    onSave={handleUpdateAddress}
                    onCancel={() => setEditingId(null)}
                    loading={addrLoading}
                  />
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {addr.label && (
                          <span className="text-xs font-semibold text-foreground">{addr.label}</span>
                        )}
                        {addr.isDefault && (
                          <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-foreground">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
                      <p className="text-sm text-muted-foreground">{addr.city}, {addr.postcode} · {addr.country}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!addr.isDefault && (
                        <button
                          onClick={() => handleSetDefault(addr.id)}
                          disabled={addrLoading}
                          className="text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-muted disabled:opacity-40"
                          title="Set as default"
                        >
                          Set default
                        </button>
                      )}
                      <button
                        onClick={() => setEditingId(addr.id)}
                        disabled={addrLoading}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40"
                        title="Edit"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeletingId(addr.id)}
                        disabled={addrLoading}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-40"
                        title="Delete"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add address form */}
        {showAddForm && (
          <div className="rounded-xl border border-border p-4 mb-3">
            <p className="text-sm font-semibold text-foreground mb-3">New address</p>
            <AddressForm
              onSave={handleAddAddress}
              onCancel={() => setShowAddForm(false)}
              loading={addrLoading}
            />
          </div>
        )}

        {addresses.length === 0 && !showAddForm && (
          <div className="text-center py-8 rounded-xl border border-dashed border-border">
            <svg className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm text-muted-foreground">No saved addresses yet</p>
            <button onClick={() => setShowAddForm(true)} className="text-xs text-primary font-semibold hover:underline mt-1">
              Add your first address
            </button>
          </div>
        )}
      </div>

      {/* ── Change password ── */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-heading font-bold text-foreground mb-1">Change Password</h2>
        <p className="text-sm text-muted-foreground mb-5">Leave blank if you don&apos;t want to change it.</p>

        <form id="password-form" onSubmit={handlePassword} className="space-y-4">
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
            <button type="submit" disabled={passwordLoading}
              className="bg-primary text-primary-foreground text-sm font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2">
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

      {/* ── Password confirmation modal ── */}
      {showPasswordConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowPasswordConfirm(false)} />
          <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h3 className="font-heading font-bold text-foreground text-lg">Change Password?</h3>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to update your password? You will need to use the new password next time you sign in.
            </p>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setShowPasswordConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors">
                Cancel
              </button>
              <button type="button" onClick={confirmPasswordChange} disabled={passwordLoading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
                {passwordLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Updating…
                  </>
                ) : "Yes, change it"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete address confirmation modal ── */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeletingId(null)} />
          <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h3 className="font-heading font-bold text-foreground text-lg">Delete address?</h3>
            <p className="text-sm text-muted-foreground">This address will be permanently removed.</p>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setDeletingId(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors">
                Cancel
              </button>
              <button type="button" onClick={() => handleDeleteAddress(deletingId)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-destructive text-white text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
