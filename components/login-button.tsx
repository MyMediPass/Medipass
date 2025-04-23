"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"

export function LoginButton() {
  const router = useRouter()
  const { isAuthenticated, logout } = useAuth()

  const handleLogin = () => {
    router.push("/login")
  }

  return isAuthenticated ? (
    <Button variant="outline" onClick={logout}>
      Logout
    </Button>
  ) : (
    <Button onClick={handleLogin}>Login</Button>
  )
}
