"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

export default function ConfirmationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const status = searchParams.get("status")
    const message = searchParams.get("message")

    if (status === "success") {
      setStatus("success")
      setMessage(message || "Your email has been successfully verified!")
    } else if (status === "error") {
      setStatus("error")
      setMessage(message || "There was a problem verifying your email. Please try again.")
    } else {
      setStatus("error")
      setMessage("Invalid confirmation link.")
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
            <CardTitle className="text-2xl font-bold text-center">Email Verification</CardTitle>
            <CardDescription className="text-center">
              {status === "loading" ? "Verifying your email address..." : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            {status === "loading" && (
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-16 w-16 text-primary animate-spin" />
                <p className="text-center text-muted-foreground">Verifying your email address...</p>
              </div>
            )}

            {status === "success" && (
              <div className="flex flex-col items-center space-y-4">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
                <p className="text-center text-lg font-medium">{message}</p>
                <p className="text-center text-muted-foreground">
                  Your account is now active. You can now sign in to access your health dashboard.
                </p>
              </div>
            )}

            {status === "error" && (
              <div className="flex flex-col items-center space-y-4">
                <XCircle className="h-16 w-16 text-destructive" />
                <p className="text-center text-lg font-medium">{message}</p>
                <p className="text-center text-muted-foreground">
                  Please check your email for a new verification link or contact support if the problem persists.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            {status === "success" && (
              <Button className="w-full" onClick={() => router.push("/login")}>
                Sign In
              </Button>
            )}

            {status === "error" && (
              <Button className="w-full" variant="outline" onClick={() => router.push("/register")}>
                Back to Sign Up
              </Button>
            )}

            <div className="text-sm text-center text-muted-foreground">
              Need help?{" "}
              <Link href="#" className="text-primary hover:underline">
                Contact Support
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
