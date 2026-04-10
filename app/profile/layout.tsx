import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Header from "@/components/layout/header"
import ProfileSidebar from "@/components/profile/profile-sidebar"

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect("/login?from=/profile")

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-[240px_1fr] gap-8 items-start">
          <ProfileSidebar user={session.user} />
          <main>{children}</main>
        </div>
      </div>
    </div>
  )
}
