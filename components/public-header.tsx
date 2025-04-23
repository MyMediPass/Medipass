"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { useAuth } from "@/context/auth-context"

export function PublicHeader() {
  const router = useRouter()
  const { isAuthenticated, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Use the Logo with its own link wrapper */}
        <Logo />

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Button variant="outline" onClick={() => router.push("/dashboard")}>
                Dashboard
              </Button>
              <Button variant="outline" onClick={signOut}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => router.push("/login")}>
                Login
              </Button>
              <Button onClick={() => router.push("/register")}>Sign up</Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
