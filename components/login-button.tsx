"use client"

import { Button } from "@/components/ui/button"
import { useUser } from "@/components/user-provider"
import { useRouter } from "next/navigation"

export function LoginButton() {
  const { isAuthenticated, signOut } = useUser()
  const router = useRouter()

  if (isAuthenticated) {
    return (
      <Button variant="outline" onClick={() => signOut()}>
        Sign out
      </Button>
    )
  }

  return (
    <Button onClick={() => router.push('/login')}>
      Sign in
    </Button>
  )
}
