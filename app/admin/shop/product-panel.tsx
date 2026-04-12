"use client"

import { useActionState, useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { toast } from "sonner"
import { createProduct, updateProduct } from "./actions"
import ImageUploader from "@/components/admin/image-uploader"

type Category = { id: string; name: string }

type ProductSize = { id?: string; label: string; price: number }

type Product = {
  id:          string
  name:        string
  slug:        string
  categoryId:  string
  price:       number
  description: string | null
  imageUrl:    string | null
  isActive:    boolean
  isFeatured:  boolean
  sizes:       ProductSize[]
}

type Props = {
  open:       boolean
  onClose:    () => void
  categories: Category[]
  editing:    Product | null
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

const inputCls = "w-full px-3 py-2 text-sm border border-border rounded-lg bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
const labelCls = "block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1"

export default function ProductPanel({ open, onClose, categories, editing }: Props) {
  const isEdit = !!editing
  const action = isEdit ? updateProduct : createProduct

  const [state, formAction, pending] = useActionState(action, undefined)
  const [slugTouched, setSlugTouched] = useState(false)
  const [nameValue,   setNameValue]   = useState(editing?.name     ?? "")
  const [manualSlug,  setManualSlug]  = useState(editing?.slug     ?? "")
  const [imageUrl,    setImageUrl]    = useState(editing?.imageUrl ?? "")
  const [sizes, setSizes] = useState<{ label: string; price: string }[]>(
    editing?.sizes.map((s) => ({ label: s.label, price: (s.price / 100).toFixed(2) })) ?? []
  )

  const slugValue = slugTouched ? manualSlug : (nameValue ? slugify(nameValue) : manualSlug)

  useEffect(() => {
    if (!state) return
    if (state.error)   toast.error(state.error)
    if (state.success) {
      toast.success(isEdit ? "Product updated." : "Product created.")
      onClose()
    }
  }, [state, isEdit, onClose])

  function addSize() {
    setSizes((prev) => [...prev, { label: "", price: "" }])
  }

  function removeSize(i: number) {
    setSizes((prev) => prev.filter((_, idx) => idx !== i))
  }

  function updateSize(i: number, field: "label" | "price", value: string) {
    setSizes((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s))
  }

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
          {/* Sizes serialized as JSON */}
          <input type="hidden" name="sizesJson" value={JSON.stringify(sizes)} />

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelCls}>Product Name *</label>
              <input
                name="name"
                required
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                placeholder="Versace Eros — Eau de Parfum"
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
                placeholder="versace-eros-eau-de-parfum"
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

            <div className="col-span-2">
              <label className={labelCls}>Base Price (CA$)</label>
              <input
                name="price"
                type="number"
                min={0}
                step={0.01}
                defaultValue={editing ? (editing.price / 100).toFixed(2) : "0.00"}
                placeholder="0.00"
                className={inputCls}
              />
              <p className="text-[11px] text-muted-foreground mt-1">Used as fallback when no sizes are defined.</p>
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
                placeholder="Describe this product…"
                className={`${inputCls} resize-none`}
              />
            </div>
          </div>

          {/* ── Sizes ──────────────────────────────────────────────── */}
          <div className="border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Sizes & Prices</p>
                <p className="text-[11px] text-muted-foreground/70 mt-0.5">e.g. 10ml, 50ml, 100ml, 200ml</p>
              </div>
              <button
                type="button"
                onClick={addSize}
                className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:opacity-75 transition-opacity"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Size
              </button>
            </div>

            {sizes.length === 0 ? (
              <p className="text-xs text-muted-foreground/60 text-center py-2">
                No sizes — base price will be used.
              </p>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-[1fr_1fr_auto] gap-2 px-1">
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Label</span>
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Price (CA$)</span>
                  <span />
                </div>
                {sizes.map((size, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                    <input
                      type="text"
                      value={size.label}
                      onChange={(e) => updateSize(i, "label", e.target.value)}
                      placeholder="50ml"
                      className={inputCls}
                    />
                    <input
                      type="number"
                      value={size.price}
                      onChange={(e) => updateSize(i, "price", e.target.value)}
                      min={0}
                      step={0.01}
                      placeholder="49.00"
                      className={inputCls}
                    />
                    <button
                      type="button"
                      onClick={() => removeSize(i)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Flags */}
          <div className="border border-border rounded-xl p-4 space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Visibility</p>
            {[
              { name: "isActive",   label: "Active",   sub: "Visible and available for purchase",           defaultChecked: editing?.isActive  ?? true  },
              { name: "isFeatured", label: "Featured", sub: "Shown in featured sections on the storefront",  defaultChecked: editing?.isFeatured ?? false },
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
