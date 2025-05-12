import type React from "react"
import { requireAuth } from '@/lib/auth'

export async function ProtectedRoute({ children }: { children: React.ReactNode }) {
  await requireAuth()
  return <>{children}</>
}
