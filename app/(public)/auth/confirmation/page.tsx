"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle } from "lucide-react"
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Logo } from "@/components/logo"

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: { message?: string; error?: string; code?: string }
}) {
  const supabase = await createClient()

  // Check if we have a code in the URL
  const code = searchParams?.code

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      redirect('/dashboard')
    }
  }

  const [status, setStatus] = useState<"success" | "error">("success")
  const [message, setMessage] = useState("Thank you! Your email has been confirmed.")

  useEffect(() => {
    // Only update if searchParams exists and has a status
    if (searchParams && searchParams.has("status")) {
      const statusParam = searchParams.get("status")
      if (statusParam === "error") {
        setStatus("error")
        const errorMsg = searchParams.get("message")
        setMessage(errorMsg || "There was a problem verifying your email. Please try again.")
      } else if (statusParam === "success") {
        setStatus("success")
        const successMsg = searchParams.get("message")
        setMessage(successMsg || "Thank you! Your email has been confirmed.")
      }
    }
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo size="lg" />
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Email Confirmation</CardTitle>
            <CardDescription>
              {searchParams.error
                ? "There was an error confirming your email. Please try again."
                : "Please check your email to confirm your account."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Button asChild>
              <Link href="/login">Return to login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
