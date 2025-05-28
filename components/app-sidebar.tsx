"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  HelpCircleIcon,
  SearchIcon,
  Home,
  BarChart2,
  FileText,
  Pill,
  Calendar,
  Activity,
  Syringe,
  User,
  FolderOpen,
  StickyNote,
  MessageSquare,
  Settings,
} from "lucide-react"

import { useUser, useClerk } from "@clerk/nextjs"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { Logo } from "./logo"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar"

import type { LucideIcon } from "lucide-react"

interface NavItem {
  name: string
  href: string
  icon: LucideIcon
  title?: string
  url?: string
}

interface NavItemGroup {
  groupTitle: string
  items: NavItem[]
}

const primaryNavConfig: NavItemGroup[] = [
  {
    groupTitle: "Overview",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: Home },
      { name: "Health Summary", href: "/health-summary", icon: BarChart2 },
    ],
  },
  {
    groupTitle: "Records",
    items: [
      { name: "Test Results", href: "/test-results", icon: FileText },
      { name: "Medications", href: "/medications", icon: Pill },
      { name: "Appointments", href: "/visits", icon: Calendar },
      { name: "Health Vitals", href: "/health-vitals", icon: Activity },
      { name: "Vaccinations", href: "/vaccination-record", icon: Syringe },
      { name: "Family History", href: "/family-history", icon: User },
    ],
  },
  {
    groupTitle: "Notes & Files",
    items: [
      { name: "Health Notes", href: "/health-notes", icon: StickyNote },
      { name: "Documents", href: "/documents", icon: FolderOpen },
    ],
  },
  {
    groupTitle: "Communication",
    items: [
      // { name: "Chat", href: "/chat", icon: MessageSquare },
      { name: "Chat History", href: "/chat-history", icon: MessageSquare },
      { name: "Profile", href: process.env.NEXT_PUBLIC_CLERK_USER_PROFILE_URL || "/user-profile", icon: User },
    ],
  },
]

const adminNavItem: NavItem = {
  name: "Admin Settings",
  href: "/admin/settings",
  icon: Settings,
}

const staticNavSecondaryItems = [
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
  {
    title: "Get Help",
    url: "/help",
    icon: HelpCircleIcon,
  },
  {
    title: "Search",
    url: "/search",
    icon: SearchIcon,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()

  // TODO: Replace isAdmin with actual logic based on Clerk user roles/permissions
  // For example, user?.publicMetadata?.isAdmin or check organization roles.
  const isAdmin = user?.publicMetadata?.['isAdmin'] === true

  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()

  React.useEffect(() => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }, [pathname, isMobile, setOpenMobile])

  const currentAdminItem = isAdmin ? adminNavItem : undefined;

  // Wait for Clerk to load before rendering user-dependent UI
  if (!isLoaded) {
    return <Sidebar collapsible="offcanvas" {...props} className="main-sidebar"><SidebarHeader><Logo size="lg" linkWrapper={false} /></SidebarHeader><SidebarContent></SidebarContent></Sidebar>; // Or a proper skeleton
  }

  return (
    <Sidebar collapsible="offcanvas" {...props} className="main-sidebar">
      <SidebarHeader>
        <Link href="/dashboard">
          <Logo size="lg" linkWrapper={false} />
        </Link>
        <div className="mt-4">
          <Button
            variant="outline"
            className="w-full justify-start"
            size="sm"
            asChild
          >
            <Link href="/chat">
              <MessageSquare className="h-4 w-4 mr-2" />
              Ask Healie
            </Link>
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain navGroups={primaryNavConfig} adminItem={currentAdminItem} />
      </SidebarContent>
      <SidebarFooter>
        {/* Pass Clerk user object and signOut function to NavUser */}
        {user && <NavUser user={user} onSignOut={signOut} />}
      </SidebarFooter>
    </Sidebar>
  )
}
