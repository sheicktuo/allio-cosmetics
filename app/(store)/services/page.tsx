import Link from "next/link"
import Header from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getCategoriesWithServices, categoryEmoji } from "@/lib/shop"

export const metadata = { title: "Services — Allio Cosmetics" }

function formatPrice(cents: number) {
  return `CA$${(cents / 100).toFixed(0)}`
}

export default async function ServicesPage() {
  const categories = await getCategoriesWithServices()

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold text-foreground mb-4">Our Services</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professional perfume reconditioning by expert hands. Every bottle treated with care.
          </p>
        </div>

        {categories.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-5xl mb-4">📦</p>
            <p className="text-lg font-semibold text-foreground mb-1">No services available yet</p>
            <p>Check back soon — we&apos;re adding new offerings.</p>
          </div>
        )}

        <div className="space-y-16">
          {categories.map((cat) => {
            if (cat.services.length === 0) return null
            const emoji = categoryEmoji(cat.slug)

            return (
              <div key={cat.slug}>
                <h2 className="text-2xl font-bold text-foreground mb-6 pb-3 border-b border-border">
                  {cat.name}
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {cat.services.map((service) => (
                    <div
                      key={service.slug}
                      className="border border-border rounded-2xl p-8 hover:shadow-lg transition-shadow relative bg-card"
                    >
                      {service.isFeatured && (
                        <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                          Most Popular
                        </Badge>
                      )}

                      <div className="flex items-start gap-4 mb-3">
                        {service.imageUrl ? (
                          <img
                            src={service.imageUrl}
                            alt={service.name}
                            className="w-14 h-14 rounded-xl object-cover shrink-0"
                          />
                        ) : (
                          <span className="text-4xl shrink-0">{emoji}</span>
                        )}
                        <h3 className="text-xl font-bold text-foreground">{service.name}</h3>
                      </div>

                      <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                        {service.description}
                      </p>

                      <div className="flex items-center gap-4 mb-6">
                        <span className="text-2xl font-bold text-foreground">
                          {formatPrice(service.price)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {service.turnaroundDays}-day turnaround
                        </span>
                      </div>

                      {service.addons.length > 0 && (
                        <div className="mb-6">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                            Available add-ons
                          </p>
                          <ul className="space-y-1">
                            {service.addons.map((addon) => (
                              <li key={addon.id} className="text-sm text-muted-foreground flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                {addon.name} (+ {formatPrice(addon.price)})
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <Button asChild className="w-full bg-primary hover:opacity-90 text-primary-foreground">
                        <Link href={`/shop/product/${service.slug}`}>View & Book</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
