"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  BarChart2,
  FileText,
  Pill,
  Calendar,
  FolderOpen,
  MessageSquare,
  User,
  Menu,
  Syringe,
  StickyNote,
  Activity,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Logo } from "@/components/logo"

// Updated navigation items with new Health Vitals page
const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Health Summary", href: "/health-summary", icon: BarChart2 },
  { name: "Test Results", href: "/test-results", icon: FileText },
  { name: "Health Vitals", href: "/health-vitals", icon: Activity },
  { name: "Medications", href: "/medications", icon: Pill },
  { name: "Visits", href: "/visits", icon: Calendar },
  { name: "Vaccination Record", href: "/vaccination-record", icon: Syringe },
  { name: "My Documents", href: "/documents", icon: FolderOpen },
  { name: "My Health Notes", href: "/health-notes", icon: StickyNote },
  { name: "Chat History", href: "/chat-history", icon: MessageSquare },
  { name: "Profile", href: "/profile", icon: User },
]

export function Navigation() {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Set initial state based on window width
    setIsMobile(window.innerWidth < 768)

    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Add event listener
    window.addEventListener("resize", checkScreenSize)

    // Clean up
    return () => {
      window.removeEventListener("resize", checkScreenSize)
    }
  }, [])

  if (isMobile) {
    return (
      <>
        {/* Mobile Header */}
        <div className="fixed top-0 left-0 right-0 h-14 border-b bg-background z-50 flex items-center px-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="p-6 flex justify-center">
                <Logo size="lg" />
              </div>
              <nav className="flex flex-col gap-1 p-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                      pathname === item.href
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-muted text-muted-foreground",
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <div className="flex-1 flex justify-center">
            <Logo />
          </div>
        </div>

        {/* Spacer for fixed header */}
        <div className="h-14 mb-2"></div>
      </>
    )
  }

  return (
    <SidebarProvider>
      <Sidebar className="border-r">
        <SidebarHeader className="border-b p-4 flex justify-center">
          <Logo size="lg" />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={pathname === item.href}>
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="border-t p-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <User className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">John Doe</p>
              <p className="text-xs text-muted-foreground">Patient</p>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  )
}
