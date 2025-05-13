"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useUser } from "@/components/user-provider"
import { Logo } from "./logo"

export function PublicHeader() {
  const { isAuthenticated, signOut } = useUser()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center">
            {isAuthenticated ? (
              <>
                <Button asChild variant="ghost" className="mr-2">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button variant="outline" onClick={() => signOut()}>
                  Sign out
                </Button>
              </>
            ) : (
              <Button asChild>
                <Link href="/login">Sign in</Link>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
