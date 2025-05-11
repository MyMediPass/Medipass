"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ArrowUpCircleIcon,
  BarChartIcon,
  CameraIcon,
  ClipboardListIcon,
  DatabaseIcon,
  FileCodeIcon,
  FileIcon,
  FileTextIcon,
  FolderIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  ListIcon,
  SearchIcon,
  SettingsIcon,
  UsersIcon,
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
  LogOut,
} from "lucide-react"

import { useAuth } from "@/context/auth-context"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { Logo } from "./logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
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
      { name: "Past Visits", href: "/visits", icon: Calendar },
      { name: "Health Vitals", href: "/health-vitals", icon: Activity },
      { name: "Vaccinations", href: "/vaccination-record", icon: Syringe },
    ],
  },
  {
    groupTitle: "Personal Info",
    items: [
      { name: "Profile", href: "/profile", icon: User },
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
    items: [{ name: "Chat History", href: "/chat-history", icon: MessageSquare }],
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
  const { user: authUser, signOut } = useAuth()
  const isAdmin = authUser?.role === "admin"

  const currentAdminItem = isAdmin ? adminNavItem : undefined;

  const userPropForNavUser = React.useMemo(() => {
    if (!authUser) return null

    // Extract user metadata, if it exists
    const metadata = authUser.user_metadata || {};

    // Determine the name: check common metadata fields, then email, then fallback
    const userName = metadata.name || metadata.full_name || authUser.email || "User";

    // Determine the avatar: check common metadata fields for an avatar URL
    const userAvatar = metadata.avatar_url || metadata.picture || undefined;

    return {
      name: userName as string, // Cast to string, as it will have a fallback
      email: (authUser.email as string) || "",
      avatar: userAvatar as string | undefined, // This can be undefined
    }
  }, [authUser])

  return (
    <Sidebar collapsible="offcanvas" {...props} className="main-sidebar">
      <SidebarHeader>
        <Link href="/dashboard">
          <Logo size="lg" linkWrapper={false} />
        </Link>
      </SidebarHeader>
      <SidebarContent>
          <NavMain navGroups={primaryNavConfig} adminItem={currentAdminItem} />
      </SidebarContent>
      <SidebarFooter>
        {userPropForNavUser && <NavUser user={userPropForNavUser} onSignOut={signOut} />}
      </SidebarFooter>
    </Sidebar>
  )
}
