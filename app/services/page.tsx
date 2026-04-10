import Link from "next/link"
import Header from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const metadata = { title: "Services" }

const categories = [
  {
    slug: "reconditioning",
    name: "Reconditioning",
    services: [
      {
        slug: "full-reconditioning",
        name: "Full Reconditioning",
        description: "Our most comprehensive service. Includes fragrance assessment, top-up to original concentration, full bottle cleaning, descaling, and presentation polish. Returned in a protective gift box.",
        price: 4900,
        turnaround: 5,
        popular: true,
        addons: ["Express 48hr (+ £15)", "Bottle engraving (+ £20)", "Gift wrapping (+ £5)"],
      },
      {
        slug: "scent-refresh",
        name: "Scent Refresh",
        description: "Fragrance has faded? We top up your concentration to restore the original scent profile. Perfect for bottles that are low but not empty.",
        price: 2900,
        turnaround: 3,
        popular: false,
        addons: ["Custom scent blend (+ £30)", "Express 48hr (+ £15)"],
      },
    ],
  },
  {
    slug: "restoration",
    name: "Bottle Restoration",
    services: [
      {
        slug: "bottle-restoration",
        name: "Bottle Restoration",
        description: "Deep cleaning and descaling for the bottle exterior and atomiser. Removes residue, watermarks, and tarnishing. Leaves your bottle looking showroom-fresh.",
        price: 1900,
        turnaround: 3,
        popular: false,
        addons: ["Atomiser replacement (+ £12)", "Bottle engraving (+ £20)"],
      },
      {
        slug: "atomiser-service",
        name: "Atomiser Service",
        description: "Clean, re-seal, or replace a faulty spray mechanism. Fixes weak sprays, leaks, and blockages.",
        price: 1200,
        turnaround: 2,
        popular: false,
        addons: [],
      },
    ],
  },
  {
    slug: "bespoke",
    name: "Bespoke",
    services: [
      {
        slug: "custom-blending",
        name: "Custom Blending",
        description: "Work 1-on-1 with our in-house perfumer to create a bespoke fragrance or modify an existing one. Includes a 30-min virtual consultation.",
        price: 7900,
        turnaround: 10,
        popular: false,
        addons: ["In-person consultation (+ £40)", "Second revision (+ £25)"],
      },
    ],
  },
]

function formatPrice(pence: number) {
  return `£${(pence / 100).toFixed(0)}`
}

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Our Services</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Professional perfume reconditioning by expert hands. Every bottle treated with care.
          </p>
        </div>

        <div className="space-y-16">
          {categories.map((cat) => (
            <div key={cat.slug}>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-100 dark:border-gray-800">
                {cat.name}
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {cat.services.map((service) => (
                  <div
                    key={service.slug}
                    className="border border-gray-100 dark:border-gray-800 rounded-2xl p-8 hover:shadow-lg transition-shadow relative"
                  >
                    {service.popular && (
                      <Badge className="absolute top-4 right-4 bg-rose-600 text-white">Most Popular</Badge>
                    )}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{service.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">{service.description}</p>

                    <div className="flex items-center gap-4 mb-6">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(service.price)}</span>
                      <span className="text-sm text-gray-500">{service.turnaround}-day turnaround</span>
                    </div>

                    {service.addons.length > 0 && (
                      <div className="mb-6">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Available add-ons</p>
                        <ul className="space-y-1">
                          {service.addons.map((addon) => (
                            <li key={addon} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0" />
                              {addon}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <Button asChild className="w-full bg-rose-600 hover:bg-rose-700 text-white">
                      <Link href={`/book?service=${service.slug}`}>Book This Service</Link>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
