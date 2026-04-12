import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import SettingsForm from "./settings-form"

export const metadata = { title: "Settings" }

export default async function SettingsPage() {
  const session = await auth()
  const [user, addresses] = await Promise.all([
    prisma.user.findUnique({
      where:  { email: session!.user.email! },
      select: { name: true, email: true, phone: true },
    }),
    prisma.address.findMany({
      where:   { user: { email: session!.user.email! } },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account details and password</p>
      </div>
      <SettingsForm user={user} addresses={addresses} />
    </div>
  )
}
