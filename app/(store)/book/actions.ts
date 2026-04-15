"use server"

import { auth }    from "@/auth"
import { prisma }  from "@/lib/prisma"
import { resend }  from "@/lib/resend"

// ─── Types ───────────────────────────────────────────────────────────────────

export type RequestItem = {
  brand:          string
  perfumeName:    string
  concentration?: string | null
  size?:          string | null
}

export type RequestData = {
  name:   string
  email:  string
  phone?: string
  notes?: string
  items:  RequestItem[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Escape user-supplied strings before embedding them in email HTML. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

/** Compose a one-liner describing an item: "Dior — Sauvage (EDP, 100ml)" */
function itemLabel(it: RequestItem): string {
  const extras = [it.concentration, it.size].filter((v): v is string => !!v).join(", ")
  return `${it.brand} — ${it.perfumeName}${extras ? ` (${extras})` : ""}`
}

/** Short email-subject summary: "Dior — Sauvage" or "Dior — Sauvage + 2 more" */
function summarizeItems(items: RequestItem[]): string {
  if (items.length === 0) return "Perfume request"
  const first = `${items[0].brand} — ${items[0].perfumeName}`
  return items.length === 1 ? first : `${first} + ${items.length - 1} more`
}

// ─── Server action ───────────────────────────────────────────────────────────

export async function submitRequest(
  data: RequestData,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!data.name.trim() || !data.email.trim()) {
      return { success: false, error: "Please fill in your name and email." }
    }

    const items = data.items
      .map((it) => ({
        brand:         it.brand.trim(),
        perfumeName:   it.perfumeName.trim(),
        concentration: it.concentration?.trim() || null,
        size:          it.size?.trim()          || null,
      }))
      .filter((it) => it.brand && it.perfumeName)

    if (items.length === 0) {
      return { success: false, error: "Please add at least one perfume." }
    }

    const session = await auth()

    const request = await prisma.customRequest.create({
      data: {
        userId: session?.user?.id ?? null,
        name:   data.name.trim(),
        email:  data.email.trim().toLowerCase(),
        phone:  data.phone?.trim() || null,
        notes:  data.notes?.trim() || null,
        items:  { create: items },
      },
    })

    const settings     = await prisma.businessSettings.findFirst({
      select: { email: true, businessName: true },
    })
    const businessName = settings?.businessName ?? "Allio Cosmetics"
    const adminEmail   = settings?.email
    const firstName    = data.name.split(" ")[0]
    const summary      = summarizeItems(items)

    // ── Customer confirmation ────────────────────────────────────────────
    const customerItemsHtml = items
      .map((it) => `<li style="padding:6px 0;font-size:14px;color:#1a1a1a;">${esc(itemLabel(it))}</li>`)
      .join("")

    await resend.emails.send({
      from:    `${businessName} <noreply@alliocosmetics.com>`,
      to:      data.email,
      subject: `We received your request — ${summary}`,
      html: `
        <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
          <div style="text-align:center;padding:40px 0 24px;">
            <h1 style="font-size:26px;font-weight:700;color:#C9A84C;margin:0;">${esc(businessName)}</h1>
          </div>
          <div style="padding:32px;background:#fafaf9;border-radius:16px;border:1px solid #e8e0d4;">
            <h2 style="font-size:20px;font-weight:700;margin:0 0 8px;">Request Received ✓</h2>
            <p style="color:#666;margin:0 0 24px;font-size:14px;line-height:1.6;">
              Hi ${esc(firstName)}, thanks for reaching out. We&apos;ll check availability
              and get back to you within <strong>48 hours</strong>.
            </p>
            <div style="background:#fff;border-radius:12px;padding:20px;border:1px solid #e8e0d4;margin-bottom:16px;">
              <p style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:.1em;margin:0 0 10px;">
                ${items.length === 1 ? "You requested" : `You requested ${items.length} perfumes`}
              </p>
              <ul style="margin:0;padding-left:18px;list-style:disc;">
                ${customerItemsHtml}
              </ul>
            </div>
            <p style="font-size:13px;color:#666;line-height:1.6;margin:0;">
              We&apos;ll send a confirmation with pricing and availability to this email address.
            </p>
          </div>
          <p style="text-align:center;font-size:11px;color:#bbb;padding:24px 0;">
            © ${new Date().getFullYear()} ${esc(businessName)}
          </p>
        </div>
      `,
    })

    // ── Admin notification ───────────────────────────────────────────────
    if (adminEmail) {
      const adminItemsHtml = items
        .map((it) => `<tr>
          <td style="padding:6px 10px 6px 0;font-weight:600;">${esc(it.brand)}</td>
          <td style="padding:6px 10px 6px 0;">${esc(it.perfumeName)}</td>
          <td style="padding:6px 10px 6px 0;color:#666;">${esc(it.concentration ?? "—")}</td>
          <td style="padding:6px 0;color:#666;">${esc(it.size ?? "—")}</td>
        </tr>`)
        .join("")

      await resend.emails.send({
        from:    `${businessName} <noreply@alliocosmetics.com>`,
        to:      adminEmail,
        subject: `New Request: ${summary}`,
        html: `
          <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
            <h2 style="font-size:18px;font-weight:700;margin:0 0 16px;">New Perfume Request</h2>

            <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px;">
              <tr><td style="padding:6px 0;color:#888;width:140px;">From</td><td style="padding:6px 0;font-weight:600;">${esc(data.name)} &lt;${esc(data.email)}&gt;</td></tr>
              ${data.phone ? `<tr><td style="padding:6px 0;color:#888;">Phone</td><td style="padding:6px 0;">${esc(data.phone)}</td></tr>` : ""}
            </table>

            <div style="margin-bottom:20px;">
              <p style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.08em;margin:0 0 8px;">Perfumes requested</p>
              <table style="width:100%;border-collapse:collapse;font-size:13px;">
                <thead>
                  <tr style="background:#f9f9f9;">
                    <th style="padding:8px 10px 8px 0;text-align:left;color:#888;font-weight:600;">Brand</th>
                    <th style="padding:8px 10px 8px 0;text-align:left;color:#888;font-weight:600;">Name</th>
                    <th style="padding:8px 10px 8px 0;text-align:left;color:#888;font-weight:600;">Type</th>
                    <th style="padding:8px 0;text-align:left;color:#888;font-weight:600;">Size</th>
                  </tr>
                </thead>
                <tbody>
                  ${adminItemsHtml}
                </tbody>
              </table>
            </div>

            ${data.notes ? `
              <div style="padding:16px;background:#f9f9f9;border-radius:8px;border-left:3px solid #C9A84C;margin-bottom:20px;">
                <p style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.08em;margin:0 0 6px;">Notes</p>
                <p style="font-size:13px;color:#444;line-height:1.6;margin:0;white-space:pre-wrap;">${esc(data.notes)}</p>
              </div>` : ""}

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
