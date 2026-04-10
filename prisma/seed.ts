import { PrismaClient, Role } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // ─── Admin user ──────────────────────────────────────────────────────────

  const email = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD
  const name = process.env.SEED_ADMIN_NAME ?? "Admin"

  if (!email || !password) {
    throw new Error(
      "Missing SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD in your .env file.\n" +
        "Add them before running the seed."
    )
  }

  if (password.length < 12) {
    throw new Error("SEED_ADMIN_PASSWORD must be at least 12 characters.")
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      // Only update fields that should be refreshed on re-run
      passwordHash,
      role: Role.SUPERADMIN,
      name,
    },
    create: {
      email,
      name,
      passwordHash,
      role: Role.SUPERADMIN,
    },
  })

  console.log(`✓ Admin upserted: ${admin.email} (${admin.role})`)

  // ─── Service catalog ─────────────────────────────────────────────────────

  const categories = [
    { name: "Reconditioning", slug: "reconditioning", sortOrder: 1 },
    { name: "Scent Refresh",  slug: "scent-refresh",  sortOrder: 2 },
    { name: "Bottle Care",    slug: "bottle-care",    sortOrder: 3 },
    { name: "Bespoke",        slug: "bespoke",        sortOrder: 4 },
  ]

  for (const cat of categories) {
    await prisma.serviceCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, sortOrder: cat.sortOrder },
      create: cat,
    })
  }

  console.log(`✓ ${categories.length} service categories upserted`)

  const services = [
    {
      slug: "full-reconditioning-kit",
      name: "Full Reconditioning Kit",
      description: "Complete fragrance restoration, bottle cleaning, and presentation polish.",
      price: 4900,
      categorySlug: "reconditioning",
      isActive: true,
      turnaroundDays: 5,
    },
    {
      slug: "luxury-refresh-bundle",
      name: "Luxury Refresh Bundle",
      description: "Full Reconditioning + Bottle Restoration combined at a reduced rate.",
      price: 6900,
      categorySlug: "reconditioning",
      isActive: true,
      turnaroundDays: 6,
    },
    {
      slug: "scent-refresh-set",
      name: "Scent Refresh Set",
      description: "Top up your fragrance concentration to its original intensity.",
      price: 2900,
      categorySlug: "scent-refresh",
      isActive: true,
      turnaroundDays: 3,
    },
    {
      slug: "signature-scent-refresh",
      name: "Signature Scent Refresh",
      description: "Premium concentration top-up using our house-blended base accords.",
      price: 3900,
      categorySlug: "scent-refresh",
      isActive: true,
      turnaroundDays: 5,
    },
    {
      slug: "bottle-restoration-pack",
      name: "Bottle Restoration Pack",
      description: "Deep clean, descale, and restore the bottle exterior to showroom condition.",
      price: 1900,
      categorySlug: "bottle-care",
      isActive: true,
      turnaroundDays: 4,
    },
    {
      slug: "atomiser-service",
      name: "Atomiser Service",
      description: "Clean, re-seal, or replace a faulty spray mechanism.",
      price: 1200,
      categorySlug: "bottle-care",
      isActive: true,
      turnaroundDays: 2,
    },
    {
      slug: "engraving-addon",
      name: "Bottle Engraving",
      description: "Personalise your bottle with a custom engraved message or monogram.",
      price: 2000,
      categorySlug: "bottle-care",
      isActive: true,
      turnaroundDays: 3,
    },
    {
      slug: "bespoke-blending-experience",
      name: "Bespoke Blending Experience",
      description: "Work with our perfumers to create a fully bespoke fragrance.",
      price: 7900,
      categorySlug: "bespoke",
      isActive: true,
      turnaroundDays: 10,
    },
  ]

  for (const svc of services) {
    const { categorySlug, ...data } = svc
    const category = await prisma.serviceCategory.findUnique({ where: { slug: categorySlug } })
    if (!category) continue

    await prisma.service.upsert({
      where: { slug: data.slug },
      update: { ...data, categoryId: category.id },
      create: { ...data, categoryId: category.id },
    })
  }

  console.log(`✓ ${services.length} services upserted`)
  console.log("\nSeed complete. You can now log in at /login.")
}

main()
  .catch((e) => {
    console.error("Seed failed:", e.message)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
