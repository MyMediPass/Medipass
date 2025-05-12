"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"

interface ConfirmationUIProps {
    searchParams: { message?: string; error?: string; code?: string; status?: string }
}

export function ConfirmationUI({ searchParams }: ConfirmationUIProps) {
    const [status, setStatus] = useState<"success" | "error">("success")
    const [message, setMessage] = useState("Thank you! Your email has been confirmed.")

    useEffect(() => {
        // Only update if searchParams exists and has a status
        if (searchParams?.status) {
            if (searchParams.status === "error") {
                setStatus("error")
                setMessage(searchParams.message || "There was a problem verifying your email. Please try again.")
            } else if (searchParams.status === "success") {
                setStatus("success")
                setMessage(searchParams.message || "Thank you! Your email has been confirmed.")
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
                        <Link href="/login" className="w-full">
                            <Button className="w-full">Return to login</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 