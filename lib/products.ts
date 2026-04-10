export type Product = {
  id: string
  slug: string
  name: string
  brand: string
  collection: string
  price: number
  originalPrice: number | null
  badge: string | null
  emoji: string
  description: string
  longDescription: string
  rating: number
  reviews: number
  includes: string[]
  turnaround: string
}

export const products: Product[] = [
  {
    id: "1",
    slug: "full-reconditioning-kit",
    name: "Full Reconditioning Kit",
    brand: "Allio",
    collection: "Reconditioning",
    price: 4900,
    originalPrice: 6500,
    badge: "Best Seller",
    emoji: "✨",
    description: "Complete fragrance restoration, bottle cleaning, and presentation polish.",
    longDescription:
      "Our signature service restores your designer fragrance to its original glory. Every aspect is addressed — from the concentration and projection of the scent itself, to the gleam of the bottle exterior and the precision of the spray mechanism. We treat each bottle as an individual piece, hand-checking every stage of the process.",
    rating: 4.9,
    reviews: 214,
    includes: [
      "Fragrance concentration top-up",
      "Full bottle exterior clean & polish",
      "Atomiser inspection & re-seal",
      "Presentation box refresh",
      "Certificate of reconditioning",
    ],
    turnaround: "3–5 working days",
  },
  {
    id: "2",
    slug: "scent-refresh-set",
    name: "Scent Refresh Set",
    brand: "Allio",
    collection: "Scent Refresh",
    price: 2900,
    originalPrice: null,
    badge: "New",
    emoji: "🌸",
    description: "Top up your fragrance concentration to its original intensity.",
    longDescription:
      "Over time, fragrances oxidise and the top notes fade — leaving you with a shadow of what the bottle once smelled like. Our Scent Refresh service uses matched accords to restore the original concentration and projection. The result smells freshly purchased, not restored.",
    rating: 4.8,
    reviews: 97,
    includes: [
      "Scent concentration analysis",
      "Matched accord top-up",
      "Projection & longevity test",
      "Scent profile report",
    ],
    turnaround: "2–3 working days",
  },
  {
    id: "3",
    slug: "bottle-restoration-pack",
    name: "Bottle Restoration Pack",
    brand: "Allio",
    collection: "Bottle Care",
    price: 1900,
    originalPrice: null,
    badge: null,
    emoji: "💎",
    description: "Deep clean, descale, and restore the bottle exterior to showroom condition.",
    longDescription:
      "Crystal clarity and showroom shine — that's the standard we hold every bottle to. This service removes years of residue, water marks, and surface scratches from the exterior, while carefully cleaning the cap, collar, and base. Your bottle will look the day it arrived in store.",
    rating: 4.7,
    reviews: 63,
    includes: [
      "Ultrasonic exterior clean",
      "Descale & mineral removal",
      "Surface micro-polish",
      "Cap & collar restoration",
      "Final quality inspection",
    ],
    turnaround: "2–4 working days",
  },
  {
    id: "4",
    slug: "bespoke-blending-experience",
    name: "Bespoke Blending Experience",
    brand: "Allio",
    collection: "Bespoke",
    price: 7900,
    originalPrice: null,
    badge: "Limited",
    emoji: "🧪",
    description: "Work with our perfumers to create a fully bespoke fragrance.",
    longDescription:
      "A truly one-of-a-kind experience. Work directly with our head perfumer Amélie Fontenay to create a signature fragrance — from scratch or reimagined from an existing scent you love. Each session includes a private 90-minute consultation, up to three rounds of refinement, and a final bottled creation presented in a hand-finished Allio keepsake box.",
    rating: 5.0,
    reviews: 31,
    includes: [
      "90-minute private consultation",
      "Bespoke fragrance creation",
      "Up to 3 refinement rounds",
      "50ml final bottled fragrance",
      "Allio keepsake presentation box",
      "Exclusive scent formula card",
    ],
    turnaround: "7–10 working days",
  },
  {
    id: "5",
    slug: "atomiser-service",
    name: "Atomiser Service",
    brand: "Allio",
    collection: "Bottle Care",
    price: 1200,
    originalPrice: null,
    badge: null,
    emoji: "💨",
    description: "Clean, re-seal, or replace a faulty spray mechanism.",
    longDescription:
      "A blocked or leaking atomiser is one of the most common reasons a beloved fragrance goes unused. Our atomiser service diagnoses the issue — whether a simple clean and re-seal will fix it or a like-for-like replacement is needed — and gets your spray working perfectly again.",
    rating: 4.6,
    reviews: 48,
    includes: [
      "Atomiser diagnosis",
      "Deep clean & flush",
      "Re-seal or replacement",
      "Spray pressure test",
    ],
    turnaround: "1–2 working days",
  },
  {
    id: "6",
    slug: "luxury-refresh-bundle",
    name: "Luxury Refresh Bundle",
    brand: "Allio",
    collection: "Reconditioning",
    price: 6900,
    originalPrice: 8500,
    badge: "Bundle",
    emoji: "🎁",
    description: "Full Reconditioning + Bottle Restoration combined at a reduced rate.",
    longDescription:
      "Our most comprehensive offering — the Full Reconditioning Kit and Bottle Restoration Pack combined into one seamless service at a significantly reduced rate. Perfect for bottles that need attention both inside and out. Everything arrives back looking and smelling brand new.",
    rating: 4.9,
    reviews: 88,
    includes: [
      "Everything in Full Reconditioning Kit",
      "Everything in Bottle Restoration Pack",
      "Priority queue placement",
      "Free insured return shipping",
    ],
    turnaround: "4–6 working days",
  },
  {
    id: "7",
    slug: "signature-scent-refresh",
    name: "Signature Scent Refresh",
    brand: "Allio",
    collection: "Scent Refresh",
    price: 3900,
    originalPrice: null,
    badge: null,
    emoji: "🌿",
    description: "Premium concentration top-up using our house-blended base accords.",
    longDescription:
      "Our premium tier Scent Refresh uses Allio's proprietary house-blended base accords — crafted by our in-house perfumers — to achieve a more accurate and longer-lasting restoration of your fragrance's original character. Ideal for designer fragrances with complex compositions.",
    rating: 4.8,
    reviews: 52,
    includes: [
      "Advanced scent composition analysis",
      "House-blended accord restoration",
      "Longevity & sillage optimisation",
      "Detailed scent report",
      "30-day scent guarantee",
    ],
    turnaround: "3–5 working days",
  },
  {
    id: "8",
    slug: "engraving-addon",
    name: "Bottle Engraving",
    brand: "Allio",
    collection: "Bottle Care",
    price: 2000,
    originalPrice: null,
    badge: "Add-on",
    emoji: "✍️",
    description: "Personalise your bottle with a custom engraved message or monogram.",
    longDescription:
      "Turn a fragrance into an heirloom. Our laser engraving service allows you to add a name, date, monogram, or short message to the bottle — permanently and precisely. Perfect as a gift or to mark a special occasion. We engrave on glass, metal, and most bottle finishes.",
    rating: 5.0,
    reviews: 19,
    includes: [
      "Laser engraving (up to 30 characters)",
      "Font selection from 6 styles",
      "Engraving preview before execution",
      "Final quality check",
    ],
    turnaround: "2–3 working days",
  },
]

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug)
}

export function getRelatedProducts(product: Product, limit = 3): Product[] {
  return products
    .filter((p) => p.id !== product.id && p.collection === product.collection)
    .slice(0, limit)
    .concat(
      products
        .filter((p) => p.id !== product.id && p.collection !== product.collection)
        .slice(0, Math.max(0, limit - products.filter((p) => p.id !== product.id && p.collection === product.collection).length))
    )
    .slice(0, limit)
}
