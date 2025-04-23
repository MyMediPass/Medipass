import { createServerSupabaseClient } from "@/lib/supabase"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  // Get the token and type from the URL
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get("token")
  const type = searchParams.get("type")

  // If there's no token or it's not a signup confirmation, redirect to home
  if (!token || type !== "signup") {
    return NextResponse.redirect(new URL("/", request.url))
  }

  try {
    // Create a Supabase client
    const supabase = createServerSupabaseClient()

    // Verify the email with the token
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: "signup",
    })

    if (error) {
      // If there's an error, redirect to an error page or login with error param
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent("Email verification failed")}`, request.url),
      )
    }

    // If successful, redirect to login with success message
    return NextResponse.redirect(
      new URL("/login?message=Email verified successfully! You can now log in.", request.url),
    )
  } catch (error) {
    console.error("Error verifying email:", error)
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent("Email verification failed")}`, request.url),
    )
  }
}
