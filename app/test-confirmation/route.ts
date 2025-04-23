import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  // Get the state parameter (success or error)
  const searchParams = request.nextUrl.searchParams
  const state = searchParams.get("state") || "success"

  // Redirect to the confirmation page with the appropriate status
  return NextResponse.redirect(new URL(`/auth/confirmation?status=${state}`, request.url))
}
