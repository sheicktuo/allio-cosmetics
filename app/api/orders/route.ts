import { NextResponse } from "next/server"

// Orders are created via the checkout server action (app/(store)/checkout/actions.ts).
// This route is kept as a stub to avoid 404s from any lingering references.
export async function POST() {
  return NextResponse.json({ error: "Use the checkout flow to place orders." }, { status: 410 })
}
