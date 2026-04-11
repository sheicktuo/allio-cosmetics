"use client"

import { useActionState, useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { toast } from "sonner"
import { createService, updateService } from "./actions"
import ImageUploader from "@/components/admin/image-uploader"

type Category = { id: string; name: string }

type Service = {
  id:             string
  name:           string
  slug:           string
  categoryId:     string
  price:          number
  turnaroundDays: number
  description:    string | null
  imageUrl:       string | null
  isActive:       boolean
  isFeatured:     boolean
}

type Props = {
  open:       boolean
  onClose:    () => void
  categories: Category[]
  editing:    Service | null
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

const inputCls = "w-full px-3 py-2 text-sm border border-border rounded-lg bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
const labelCls = "block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1"

export default function ProductPanel({ open, onClose, categories, editing }: Props) {
  const isEdit = !!editing
  const action = isEdit ? updateService : createService

  const [state, formAction, pending] = useActionState(action, undefined)
  // Initialized from props — component is remounted by shop-manager when open/editing changes
  const [slugTouched, setSlugTouched] = useState(false)
  const [nameValue,   setNameValue]   = useState(editing?.name  ?? "")
  const [manualSlug,  setManualSlug]  = useState(editing?.slug  ?? "")
  const [imageUrl,    setImageUrl]    = useState(editing?.imageUrl ?? "")

  // Derived inline — no effect needed for derived state
  const slugValue = slugTouched ? manualSlug : (nameValue ? slugify(nameValue) : manualSlug)

  useEffect(() => {
    if (!state) return
    if (state.error)   toast.error(state.error)
    if (state.success) {
      toast.success(isEdit ? "Product updated." : "Product created.")
      onClose()
    }
  }, [state, isEdit, onClose])

  if (!open) return null

  const panel = (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-lg z-50 bg-card border-l border-border flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="font-semibold text-foreground text-lg">
            {isEdit ? "Edit Product" : "New Product"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form id="product-form" action={formAction} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {isEdit && <input type="hidden" name="id" value={editing.id} />}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelCls}>Product Name *</label>
              <input
                name="name"
                required
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                placeholder="Full Reconditioning Kit"
                className={inputCls}
              />
            </div>

            <div className="col-span-2">
              <label className={labelCls}>Slug *</label>
              <input
                name="slug"
                required
                value={slugValue}
                onChange={(e) => { setSlugTouched(true); setManualSlug(e.target.value) }}
                placeholder="full-reconditioning-kit"
                className={`${inputCls} font-mono`}
              />
              <p className="text-[11px] text-muted-foreground mt-1">URL identifier. Auto-generated from name. Lowercase, hyphens only.</p>
            </div>

            <div className="col-span-2">
              <label className={labelCls}>Collection *</label>
              <select
                name="categoryId"
                required
                defaultValue={editing?.categoryId ?? ""}
                className={`${inputCls} bg-background`}
              >
                <option value="">Select a collection…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Price (CA$) *</label>
              <input
                name="price"
                type="number"
                required
                min={0.01}
                step={0.01}
                defaultValue={editing ? (editing.price / 100).toFixed(2) : ""}
                placeholder="49.00"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Turnaround (days) *</label>
              <input
                name="turnaroundDays"
                type="number"
                required
                min={1}
                step={1}
                defaultValue={editing?.turnaroundDays ?? 5}
                className={inputCls}
              />
            </div>

            <div className="col-span-2">
              <input type="hidden" name="imageUrl" value={imageUrl} />
              <ImageUploader
                endpoint="productImage"
                currentUrl={editing?.imageUrl}
                onUpload={(url) => setImageUrl(url)}
                label="Product Image"
              />
            </div>

            <div className="col-span-2">
              <label className={labelCls}>Description</label>
              <textarea
                name="description"
                rows={3}
                defaultValue={editing?.description ?? ""}
                placeholder="Describe what this service includes…"
                className={`${inputCls} resize-none`}
              />
            </div>
          </div>

          {/* Flags */}
          <div className="border border-border rounded-xl p-4 space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Visibility</p>
            {[
              { name: "isActive",   label: "Active",   sub: "Visible and available for purchase", defaultChecked: editing?.isActive  ?? true  },
              { name: "isFeatured", label: "Featured", sub: "Shown in featured sections on the storefront", defaultChecked: editing?.isFeatured ?? false },
            ].map((opt) => (
              <label key={opt.name} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name={opt.name}
                  value="true"
                  defaultChecked={opt.defaultChecked}
                  className="mt-0.5 w-4 h-4 accent-primary rounded"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.sub}</p>
                </div>
              </label>
            ))}
            {/* Ensure unchecked sends false */}
            <input type="hidden" name="isActive"   value="false" />
            <input type="hidden" name="isFeatured" value="false" />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium border border-border rounded-xl text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            form="product-form"
            type="submit"
            disabled={pending}
            className="flex-1 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {pending ? (isEdit ? "Saving…" : "Creating…") : (isEdit ? "Save Changes" : "Create Product")}
          </button>
        </div>
      </div>
    </>
  )

  return createPortal(panel, document.body)
}
