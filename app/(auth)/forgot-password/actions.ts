"use server"

import { prisma } from "@/lib/prisma"
import { resend } from "@/lib/resend"
import { randomBytes } from "crypto"

export async function forgotPasswordAction(
  _: unknown,
  formData: FormData,
): Promise<{ success: true } | { error: string }> {
  const email = (formData.get("email") as string).trim().toLowerCase()

  if (!email) return { error: "Email is required." }

  try {
    const user = await prisma.user.findUnique({
      where:  { email },
      select: { id: true, name: true },
    })

    // Always return success — never reveal whether the email exists
    if (!user) return { success: true }

    // Invalidate any previous unused tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data:  { used: true },
    })

    // Create a new token valid for 1 hour
    const token   = randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 60 * 60 * 1000)

    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expires },
    })

    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`

    await resend.emails.send({
      from:    "Allio Cosmetics <noreply@alliocosmetics.com>",
      to:      email,
      subject: "Reset your Allio password",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#111">
          <h2 style="margin:0 0 8px;font-size:24px">Reset your password</h2>
          <p style="color:#555;margin:0 0 24px">
            Hi ${user.name ?? "there"},<br/>
            We received a request to reset your Allio Cosmetics password.
            Click the button below — this link expires in <strong>1 hour</strong>.
          </p>
          <a href="${resetUrl}"
             style="display:inline-block;background:#b5651d;color:#fff;font-weight:600;
                    padding:14px 28px;border-radius:12px;text-decoration:none;font-size:15px">
            Reset Password
          </a>
          <p style="color:#888;font-size:13px;margin:24px 0 0">
            If you didn't request this, you can safely ignore this email.
            Your password will not change.
          </p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
          <p style="color:#aaa;font-size:12px;margin:0">
            Allio Cosmetics · alliocosmetics.com
          </p>
        </div>
      `,
    })
  } catch {
    // Swallow errors — don't leak DB / email failures to the client
  }

  return { success: true }
}
