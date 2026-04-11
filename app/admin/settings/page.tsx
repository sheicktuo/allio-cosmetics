import { prisma } from "@/lib/prisma"
import SettingsForm from "./settings-form"

export const metadata = { title: "Settings — Admin" }

export default async function AdminSettingsPage() {
  const settings = await prisma.businessSettings.findFirst()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure your business details and operational preferences</p>
      </div>
      <SettingsForm settings={settings} />
    </div>
  )
}
