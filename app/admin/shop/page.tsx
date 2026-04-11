import { prisma } from "@/lib/prisma"
import ShopManager from "./shop-manager"

export const metadata = { title: "Shop — Admin" }

export default async function AdminShopPage() {
  const [services, categories] = await Promise.all([
    prisma.service.findMany({
      orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
      include: {
        category: { select: { name: true } },
        _count:   { select: { orderItems: true } },
      },
    }),
    prisma.serviceCategory.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { services: true } } },
    }),
  ])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Shop</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your products and collections</p>
      </div>
      <ShopManager services={services} categories={categories} />
    </div>
  )
}
