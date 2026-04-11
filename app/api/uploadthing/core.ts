import { createUploadthing, type FileRouter } from "uploadthing/next"
import { auth } from "@/auth"

const f = createUploadthing()

async function requireAdmin() {
  const session = await auth()
  if (!session || !["ADMIN", "SUPERADMIN"].includes(session.user.role ?? "")) {
    throw new Error("Unauthorized")
  }
  return { userId: session.user.id }
}

export const ourFileRouter = {
  productImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(requireAdmin)
    .onUploadComplete(({ file }) => {
      return { url: file.ufsUrl }
    }),

  collectionImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(requireAdmin)
    .onUploadComplete(({ file }) => {
      return { url: file.ufsUrl }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
