import { createServerSupabaseClient } from "@/lib/supabase"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  // Get the token and type from the URL
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get("token")
  const type = searchParams.get("type")

  // If there's no token or it's not a signup confirmation, redirect to home
  if (!token || type !== "signup") {
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

    // Verify the email with the token
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: "signup",
    })

    if (error) {
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
