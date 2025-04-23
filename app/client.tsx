"use client"

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Navigation } from "@/components/navigation"
import { usePathname } from "next/navigation"

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <div className="flex min-h-screen flex-col md:flex-row">
            <Navigation />
            <main className="flex-1 p-3 md:p-6 overflow-hidden">
              <div className={`${pathname === "/" ? "p-0 -m-3 md:-m-6" : ""}`}>{children}</div>
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
