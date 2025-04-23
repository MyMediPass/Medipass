"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface HomeWrapperProps {
  children: React.ReactNode
}

export function HomeWrapper({ children }: HomeWrapperProps) {
  const pathname = usePathname()
  const isHomePage = pathname === "/"

  return (
    <div className={cn("transition-all duration-300", isHomePage ? "p-0 -m-3 md:-m-6 min-h-[calc(100vh-4rem)]" : "")}>
      {children}
    </div>
  )
}
