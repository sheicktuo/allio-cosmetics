"use client"

import { useActionState, useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { toast } from "sonner"
import { createCollection, updateCollection } from "./actions"
import ImageUploader from "@/components/admin/image-uploader"

type Collection = {
  id:          string
  name:        string
  slug:        string
  description: string | null
  imageUrl:    string | null
}

type Props = {
  open:    boolean
  onClose: () => void
  editing: Collection | null
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

const inputCls = "w-full px-3 py-2 text-sm border border-border rounded-lg bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
const labelCls = "block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1"

export default function CollectionModal({ open, onClose, editing }: Props) {
  const isEdit = !!editing
  const action = isEdit ? updateCollection : createCollection

  const [state, formAction, pending] = useActionState(action, undefined)
  // Initialized from props — component is remounted by shop-manager when open/editing changes
  const [slugTouched, setSlugTouched] = useState(false)
  const [nameValue,   setNameValue]   = useState(editing?.name     ?? "")
  const [manualSlug,  setManualSlug]  = useState(editing?.slug     ?? "")
  const [imageUrl,    setImageUrl]    = useState(editing?.imageUrl ?? "")

  // Derived inline — no effect needed for derived state
  const slugValue = slugTouched ? manualSlug : (nameValue ? slugify(nameValue) : manualSlug)

  useEffect(() => {
    if (!state) return
    if (state.error)   toast.error(state.error)
    if (state.success) {
      toast.success(isEdit ? "Collection updated." : "Collection created.")
      onClose()
    }
  }, [state, isEdit, onClose])

  if (!open) return null

  const modal = (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-card rounded-2xl shadow-2xl border border-border">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground">
              {isEdit ? "Edit Collection" : "New Collection"}
            </h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form id="collection-form" action={formAction} className="px-6 py-5 space-y-4">
            {isEdit && <input type="hidden" name="id" value={editing.id} />}

            <div>
              <label className={labelCls}>Name *</label>
              <input
                name="name"
                required
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                placeholder="Reconditioning"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Slug *</label>
              <input
                name="slug"
                required
                value={slugValue}
                onChange={(e) => { setSlugTouched(true); setManualSlug(e.target.value) }}
                placeholder="reconditioning"
                className={`${inputCls} font-mono`}
              />
              <p className="text-[11px] text-muted-foreground mt-1">Used in URLs. Lowercase, hyphens only.</p>
            </div>

            <div>
              <input type="hidden" name="imageUrl" value={imageUrl} />
              <ImageUploader
                endpoint="collectionImage"
                currentUrl={editing?.imageUrl}
                onUpload={(url) => setImageUrl(url)}
                label="Collection Image"
              />
            </div>

            <div>
              <label className={labelCls}>Description</label>
              <textarea
                name="description"
                rows={2}
                defaultValue={editing?.description ?? ""}
                placeholder="Brief description of this collection…"
                className={`${inputCls} resize-none`}
              />
            </div>
          </form>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium border border-border rounded-xl text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="collection-form"
              disabled={pending}
              className="flex-1 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {pending ? "Saving…" : (isEdit ? "Save Changes" : "Create Collection")}
            </button>
          </div>
        </div>
      </div>
    </>
  )

  return createPortal(modal, document.body)
}
