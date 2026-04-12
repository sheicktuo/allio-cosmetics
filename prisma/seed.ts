import { PrismaClient, Role } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"
import "dotenv/config"

const isRemote = process.env.DATABASE_URL?.includes("sslmode")
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
  ssl: isRemote ? { rejectUnauthorized: true } : false,
})
const prisma = new PrismaClient({ adapter })

async function main() {
  // ─── Admin user ──────────────────────────────────────────────────────────

  const email    = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD
  const name     = process.env.SEED_ADMIN_NAME ?? "Admin"

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
    where:  { email },
    update: { passwordHash, role: Role.ADMIN, name },
    create: { email, name, passwordHash, role: Role.ADMIN },
  })

  console.log(`✓ Admin upserted: ${admin.email} (${admin.role})`)

  // ─── Collections ─────────────────────────────────────────────────────────

  const categories = [
    {
      name:        "Eau de Parfum (EDP)",
      slug:        "eau-de-parfum",
      description: "Higher concentration — longer-lasting, richer projection",
      sortOrder:   1,
    },
    {
      name:        "Eau de Toilette (EDT)",
      slug:        "eau-de-toilette",
      description: "Lighter concentration — fresh, everyday wear",
      sortOrder:   2,
    },
    {
      name:        "Gift Sets",
      slug:        "gift-sets",
      description: "Curated sets — perfect for gifting",
      sortOrder:   3,
    },
    {
      name:        "New Arrivals",
      slug:        "new-arrivals",
      description: "The latest additions to our collection",
      sortOrder:   4,
    },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where:  { slug: cat.slug },
      update: { name: cat.name, description: cat.description, sortOrder: cat.sortOrder },
      create: cat,
    })
  }

  console.log(`✓ ${categories.length} collections upserted`)
  console.log("\nSeed complete. You can now log in at /login.")
}

main()
  .catch((e) => {
    console.error("Seed failed:", e.message)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
