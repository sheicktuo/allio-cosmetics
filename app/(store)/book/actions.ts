"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { resend }  from "@/lib/resend"

export type RequestData = {
  name:        string
  email:       string
  phone?:      string
  productType?: string
  subject:     string
  description: string
  budget?:     string
  inspiration?: string
}

export async function submitRequest(
  data: RequestData,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!data.name.trim() || !data.email.trim() || !data.subject.trim() || !data.description.trim()) {
      return { success: false, error: "Please fill in all required fields." }
    }

    const session = await auth()

    const request = await prisma.customRequest.create({
      data: {
        userId:      session?.user?.id ?? null,
        name:        data.name.trim(),
        email:       data.email.trim().toLowerCase(),
        phone:       data.phone?.trim()       || null,
        productType: data.productType         || null,
        subject:     data.subject.trim(),
        description: data.description.trim(),
        budget:      data.budget              || null,
        inspiration: data.inspiration?.trim() || null,
      },
    })

    const settings     = await prisma.businessSettings.findFirst({
      select: { email: true, businessName: true },
    })
    const businessName = settings?.businessName ?? "Allio Cosmetics"
    const adminEmail   = settings?.email
    const firstName    = data.name.split(" ")[0]

    // ── Customer confirmation ────────────────────────────────────────────
    await resend.emails.send({
      from:    `${businessName} <noreply@alliocosmetics.com>`,
      to:      data.email,
      subject: `We received your request — ${data.subject}`,
      html: `
        <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
          <div style="text-align:center;padding:40px 0 24px;">
            <h1 style="font-size:26px;font-weight:700;color:#C9A84C;margin:0;">${businessName}</h1>
          </div>
          <div style="padding:32px;background:#fafaf9;border-radius:16px;border:1px solid #e8e0d4;">
            <h2 style="font-size:20px;font-weight:700;margin:0 0 8px;">Request Received ✓</h2>
            <p style="color:#666;margin:0 0 24px;font-size:14px;line-height:1.6;">
              Hi ${firstName}, thank you for reaching out! We've received your custom request
              and our team will review it within <strong>48 hours</strong>.
            </p>
            <div style="background:#fff;border-radius:12px;padding:20px;border:1px solid #e8e0d4;margin-bottom:24px;">
              <p style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:.1em;margin:0 0 6px;">Your Request</p>
              <p style="font-size:16px;font-weight:600;color:#1a1a1a;margin:0 0 10px;">${data.subject}</p>
              ${data.productType ? `<p style="font-size:12px;color:#888;margin:0 0 4px;">Category: <strong style="color:#C9A84C;">${data.productType}</strong></p>` : ""}
              ${data.budget      ? `<p style="font-size:12px;color:#888;margin:0;">Budget: ${data.budget}</p>` : ""}
            </div>
            <p style="font-size:13px;color:#666;line-height:1.6;margin:0;">
              Once reviewed, we'll send a detailed quote to this email address. No action is needed from you right now.
            </p>
          </div>
          <p style="text-align:center;font-size:11px;color:#bbb;padding:24px 0;">
            © ${new Date().getFullYear()} ${businessName}
          </p>
        </div>
      `,
    })

    // ── Admin notification ───────────────────────────────────────────────
    if (adminEmail) {
      await resend.emails.send({
        from:    `${businessName} <noreply@alliocosmetics.com>`,
        to:      adminEmail,
        subject: `New Custom Request: ${data.subject}`,
        html: `
          <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
            <h2 style="font-size:18px;font-weight:700;margin:0 0 16px;">New Custom Request</h2>
            <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:16px;">
              <tr><td style="padding:6px 0;color:#888;width:110px;">From</td><td style="padding:6px 0;font-weight:600;">${data.name} &lt;${data.email}&gt;</td></tr>
              ${data.phone       ? `<tr><td style="padding:6px 0;color:#888;">Phone</td><td style="padding:6px 0;">${data.phone}</td></tr>` : ""}
              ${data.productType ? `<tr><td style="padding:6px 0;color:#888;">Category</td><td style="padding:6px 0;">${data.productType}</td></tr>` : ""}
              ${data.budget      ? `<tr><td style="padding:6px 0;color:#888;">Budget</td><td style="padding:6px 0;">${data.budget}</td></tr>` : ""}
            </table>
            <div style="padding:16px;background:#f9f9f9;border-radius:8px;border-left:3px solid #C9A84C;margin-bottom:16px;">
              <p style="font-weight:600;margin:0 0 8px;">${data.subject}</p>
              <p style="font-size:13px;color:#444;line-height:1.6;margin:0;">${data.description}</p>
            </div>
            ${data.inspiration ? `<p style="font-size:13px;color:#666;margin-bottom:16px;"><strong>Inspiration:</strong> ${data.inspiration}</p>` : ""}
            <a href="${process.env.NEXTAUTH_URL ?? ""}/admin/requests/${request.id}"
               style="display:inline-block;padding:10px 22px;background:#C9A84C;color:#fff;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">
              View Request →
            </a>
          </div>
        `,
      })
    }

    return { success: true }
  } catch (err) {
    console.error("[submitRequest]", err)
    return { success: false, error: "Something went wrong. Please try again." }
  }
}
