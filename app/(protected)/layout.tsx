import type React from "react"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { ProtectedRoute } from "@/components/protected-route"

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        <MainNav />
        <div className="flex flex-col flex-1 min-w-0">
          <main className="flex-1 p-6 overflow-auto">{children}</main>
          <Footer />
        </div>
      </div>
    </ProtectedRoute>
  )
}
