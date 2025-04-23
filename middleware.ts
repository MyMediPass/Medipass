import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // Check if this is a Supabase auth callback with a code parameter
  if (pathname === "/" && searchParams.has("code")) {
    // Get the code from the URL
    const code = searchParams.get("code")

    // Redirect to our confirmation handler with the code
    return NextResponse.redirect(new URL(`/auth/confirm?token=${code}&type=signup`, request.url))
  }

  return NextResponse.next()
}

// Only run the middleware on the home route when it has a code parameter
export const config = {
  matcher: "/",
}
