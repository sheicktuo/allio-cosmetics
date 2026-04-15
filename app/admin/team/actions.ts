"use server"

import { z }            from "zod"
import bcrypt           from "bcryptjs"
import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/require-admin"
import { prisma }       from "@/lib/prisma"
import { resend }       from "@/lib/resend"

// ── Validation ───────────────────────────────────────────────────────────────

const CreateAdminSchema = z.object({
  name:     z.string().min(1, "Name is required.").max(80),
  email:    z.string().email("Please enter a valid email address.").max(200),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(100),
})

export type CreateAdminData = z.infer<typeof CreateAdminSchema>

// ── Action ───────────────────────────────────────────────────────────────────

export async function createAdmin(
  data: CreateAdminData,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin()

    // Validate
    const parsed = CreateAdminSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message }
    }

    const { name, email, password } = parsed.data

    // Check email isn't already taken
    const existing = await prisma.user.findUnique({
      where:  { email: email.toLowerCase() },
      select: { id: true },
    })
    if (existing) {
      return { success: false, error: "An account with that email already exists." }
    }

    // Hash password & create user
    const passwordHash = await bcrypt.hash(password, 12)

    await prisma.user.create({
      data: {
        name,
        email:        email.toLowerCase(),
        passwordHash,
        role:         "ADMIN",
      },
    })

    // Send welcome email
    const settings     = await prisma.businessSettings.findFirst({
      select: { email: true, businessName: true },
    })
    const businessName = settings?.businessName ?? "Allio Cosmetics"

    await resend.emails.send({
      from:    `${businessName} <noreply@alliocosmetics.com>`,
      to:      email,
      subject: `You've been added as an admin — ${businessName}`,
      html: `
        <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;color:#1a1a1a;">
          <div style="text-align:center;padding:40px 0 24px;">
            <h1 style="font-size:24px;font-weight:700;color:#C9A84C;margin:0;">${businessName}</h1>
          </div>
          <div style="padding:32px;background:#fafaf9;border-radius:16px;border:1px solid #e8e0d4;">
            <h2 style="font-size:18px;font-weight:700;margin:0 0 12px;">Welcome to the team, ${name.split(" ")[0]}!</h2>
            <p style="font-size:14px;color:#555;line-height:1.6;margin:0 0 24px;">
              You&apos;ve been added as an admin on the ${businessName} platform.
              Use the credentials below to sign in.
            </p>
            <div style="background:#fff;border-radius:12px;padding:20px;border:1px solid #e8e0d4;margin-bottom:24px;">
              <p style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:.1em;margin:0 0 10px;">Your login details</p>
              <p style="font-size:14px;margin:0 0 6px;"><strong>Email:</strong> ${email.toLowerCase()}</p>
              <p style="font-size:14px;margin:0;"><strong>Password:</strong> ${password}</p>
            </div>
            <p style="font-size:13px;color:#888;line-height:1.6;margin:0;">
              Please change your password after your first sign-in.
            </p>
          </div>
          <p style="text-align:center;font-size:11px;color:#bbb;padding:24px 0;">
            &copy; ${new Date().getFullYear()} ${businessName}
          </p>
        </div>
      `,
    })

    revalidatePath("/admin/team")
    return { success: true }
  } catch (err) {
    console.error("[createAdmin]", err)
    return { success: false, error: "Something went wrong. Please try again." }
  }
}
