"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { ToggleSwitch } from "@/components/admin/toggle-switch"
import ProductPanel from "./product-panel"
import CollectionModal from "./collection-modal"
import {
  deleteService,
  deleteCollection,
  toggleServiceActive,
  toggleServiceFeatured,
  toggleCollectionActive,
} from "./actions"

type Category = {
  id:          string
  name:        string
  slug:        string
  description: string | null
  imageUrl:    string | null
  isActive:    boolean
  _count:      { services: number }
}

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
  category:       { name: string }
  _count:         { orderItems: number }
}

type Props = { services: Service[]; categories: Category[] }

export default function ShopManager({ services, categories }: Props) {
  const [tab, setTab]                       = useState<"products" | "collections">("products")
  const [panelOpen, setPanelOpen]           = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [modalOpen, setModalOpen]           = useState(false)
  const [editingCat, setEditingCat]         = useState<Category | null>(null)
  const [, startTransition]                 = useTransition()
  const [catFilter, setCatFilter]           = useState<string>("all")

  function openNewProduct() { setEditingService(null); setPanelOpen(true) }
  function openEditProduct(s: Service) { setEditingService(s); setPanelOpen(true) }
  function openNewCollection() { setEditingCat(null); setModalOpen(true) }
  function openEditCollection(c: Category) { setEditingCat(c); setModalOpen(true) }

  function handleDeleteService(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    startTransition(async () => {
      const fd = new FormData()
      fd.set("id", id)
      await deleteService(fd)
      toast.success("Product deleted.")
    })
  }

  function handleDeleteCollection(id: string, name: string, count: number) {
    if (count > 0) {
      toast.error(`Move or delete the ${count} product${count !== 1 ? "s" : ""} in "${name}" first.`)
      return
    }
    if (!confirm(`Delete collection "${name}"?`)) return
    startTransition(async () => {
      const fd = new FormData()
      fd.set("id", id)
      await deleteCollection(fd)
      toast.success("Collection deleted.")
    })
  }

  const filteredServices = catFilter === "all"
    ? services
    : services.filter((s) => s.categoryId === catFilter)

  const tabCls = (t: typeof tab) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
      tab === t
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:text-foreground hover:bg-muted"
    }`

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-1 bg-muted p-1 rounded-xl">
          <button className={tabCls("products")}    onClick={() => setTab("products")}>Products</button>
          <button className={tabCls("collections")} onClick={() => setTab("collections")}>Collections</button>
        </div>

        {tab === "products" ? (
          <button
            onClick={openNewProduct}
            className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </button>
        ) : (
          <button
            onClick={openNewCollection}
            className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Collection
          </button>
        )}
      </div>

      {/* ── Products Tab ─────────────────────────────────────────── */}
      {tab === "products" && (
        <>
          {/* Collection filter */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setCatFilter("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                catFilter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              All ({services.length})
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCatFilter(c.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  catFilter === c.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                {c.name} ({c._count.services})
              </button>
            ))}
          </div>

          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide bg-muted/50">
                    <th className="px-5 py-3">Product</th>
                    <th className="px-5 py-3">Collection</th>
                    <th className="px-5 py-3">Price</th>
                    <th className="px-5 py-3">Turnaround</th>
                    <th className="px-5 py-3">Orders</th>
                    <th className="px-5 py-3">Active</th>
                    <th className="px-5 py-3">Featured</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredServices.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-5 py-12 text-center text-muted-foreground">
                        No products found
                      </td>
                    </tr>
                  )}
                  {filteredServices.map((svc) => (
                    <tr key={svc.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3">
                        <p className="text-sm font-medium text-foreground">{svc.name}</p>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">{svc.slug}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                          {svc.category.name}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm font-medium text-foreground">
                        CA${(svc.price / 100).toFixed(2)}
                      </td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{svc.turnaroundDays}d</td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{svc._count.orderItems}</td>
                      <td className="px-5 py-3">
                        <ToggleSwitch id={svc.id} checked={svc.isActive}   action={toggleServiceActive} />
                      </td>
                      <td className="px-5 py-3">
                        <ToggleSwitch id={svc.id} checked={svc.isFeatured} action={toggleServiceFeatured} />
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => openEditProduct(svc)}
                            className="text-xs text-primary font-medium hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteService(svc.id, svc.name)}
                            className="text-xs text-destructive font-medium hover:opacity-70"
                            disabled={svc._count.orderItems > 0}
                            title={svc._count.orderItems > 0 ? "Cannot delete — has orders" : "Delete"}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── Collections Tab ───────────────────────────────────────── */}
      {tab === "collections" && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide bg-muted/50">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Slug</th>
                  <th className="px-5 py-3">Description</th>
                  <th className="px-5 py-3">Products</th>
                  <th className="px-5 py-3">Active</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                      No collections yet
                    </td>
                  </tr>
                )}
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-foreground">{cat.name}</td>
                    <td className="px-5 py-3 text-sm font-mono text-muted-foreground">{cat.slug}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground max-w-xs truncate">
                      {cat.description ?? <span className="text-muted-foreground/50">—</span>}
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{cat._count.services}</td>
                    <td className="px-5 py-3">
                      <ToggleSwitch id={cat.id} checked={cat.isActive} action={toggleCollectionActive} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => openEditCollection(cat)}
                          className="text-xs text-primary font-medium hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCollection(cat.id, cat.name, cat._count.services)}
                          className="text-xs text-destructive font-medium hover:opacity-70"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Panels / Modals */}
      <ProductPanel
        key={`${panelOpen}-${editingService?.id ?? "new"}`}
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        categories={categories}
        editing={editingService}
      />
      <CollectionModal
        key={`${modalOpen}-${editingCat?.id ?? "new-col"}`}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editingCat}
      />
    </>
  )
}
