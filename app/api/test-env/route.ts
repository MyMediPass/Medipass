import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "Not set",
    message:
      "If NEXT_PUBLIC_SITE_URL shows 'Not set', make sure you've added the environment variable and restarted your server.",
  })
}
