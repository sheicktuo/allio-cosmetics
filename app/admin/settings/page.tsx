import { prisma } from "@/lib/prisma"
import SettingsForm from "./settings-form"

export const metadata = { title: "Settings — Admin" }

export default async function AdminSettingsPage() {
  const settings = await prisma.businessSettings.findFirst()

  const form = settings ? {
    businessName:           settings.businessName,
    email:                  settings.email,
    phone:                  settings.phone,
    address:                settings.address,
    city:                   settings.city,
    postcode:               settings.postcode,
    country:                settings.country,
    currency:               settings.currency,
    taxLabel:               settings.taxLabel,
    deliveryFee:            settings.deliveryFee / 100,            // cents → dollars for display
    freeDeliveryThreshold:  settings.freeDeliveryThreshold / 100,  // cents → dollars
    taxRate:                settings.taxRate * 100,                 // decimal → percent
  } : null

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure your business details and operational preferences</p>
      </div>
      <SettingsForm settings={form} />
    </div>
  )
}
