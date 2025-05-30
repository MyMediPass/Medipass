import type React from "react"
import { PublicHeader } from "@/components/public-header"
import { Footer } from "@/components/footer"

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1 grid">{children}</main>
      <Footer />
    </div>
  )
}
