import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // Check if this is a Supabase auth callback with a code parameter
  if (pathname === "/" && searchParams.has("code")) {
    // For Supabase auth, we should NOT intercept the code parameter
    // Let Supabase's client-side SDK handle it instead
    return NextResponse.next()
  }

  return NextResponse.next()
}

// Only run the middleware on the home route when it has a code parameter
export const config = {
  matcher: "/",
}
