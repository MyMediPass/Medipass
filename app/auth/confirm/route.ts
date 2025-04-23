import { createServerSupabaseClient } from "@/lib/supabase"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  console.log("Confirm route handler called")

  // Get the token and type from the URL
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get("token")
  const type = searchParams.get("type")

  // For testing: force success if test_token is provided
  if (token === "test_token") {
    console.log("Test token detected, redirecting to success page")
    return NextResponse.redirect(new URL("/auth/confirmation?status=success", request.url))
  }

  // If there's no token or it's not a signup confirmation, redirect to home
  if (!token || type !== "signup") {
    console.log("Invalid token or type, redirecting to error page")
    return NextResponse.redirect(
      new URL(
        `/auth/confirmation?status=error&message=${encodeURIComponent("Invalid confirmation link")}`,
        request.url,
      ),
    )
  }

  try {
    // Create a Supabase client
    const supabase = createServerSupabaseClient()

    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(token)

    if (error) {
      console.error("Supabase verification error:", error)
      // If there's an error, redirect to the confirmation page with error status
      return NextResponse.redirect(
        new URL(
          `/auth/confirmation?status=error&message=${encodeURIComponent(error.message || "Email verification failed")}`,
          request.url,
        ),
      )
    }

    // If successful, redirect to the confirmation page with success status
    return NextResponse.redirect(
      new URL(
        `/auth/confirmation?status=success&message=${encodeURIComponent("Email verified successfully!")}`,
        request.url,
      ),
    )
  } catch (error) {
    console.error("Error verifying email:", error)
    return NextResponse.redirect(
      new URL(
        `/auth/confirmation?status=error&message=${encodeURIComponent("An unexpected error occurred")}`,
        request.url,
      ),
    )
  }
}
