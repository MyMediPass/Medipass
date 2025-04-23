"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle } from "lucide-react"

export default function ConfirmationPage() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"success" | "error">("success")
  const [message, setMessage] = useState("Thank you! Your email has been confirmed.")

  useEffect(() => {
    const status = searchParams.get("status")

    if (status === "error") {
      setStatus("error")
      setMessage("There was a problem verifying your email. Please try again.")
    }
  }, [searchParams])

  return (
    <div className="container max-w-4xl py-12">
      <Card className="border-none shadow-none">
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-6">
          {status === "success" ? (
            <>
              <CheckCircle2 className="h-16 w-16 text-green-500" />
              <h1 className="text-3xl font-bold text-center">{message}</h1>
              <p className="text-center text-muted-foreground">You can now sign in to access your health dashboard.</p>
              <div className="flex gap-4 mt-6">
                <Button asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/">Return Home</Link>
                </Button>
              </div>
            </>
          ) : (
            <>
              <XCircle className="h-16 w-16 text-destructive" />
              <h1 className="text-3xl font-bold text-center">{message}</h1>
              <p className="text-center text-muted-foreground">
                Please check your email for a new verification link or contact support.
              </p>
              <div className="flex gap-4 mt-6">
                <Button asChild>
                  <Link href="/register">Back to Sign Up</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/">Return Home</Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
