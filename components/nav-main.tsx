"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"
import type { LucideIcon } from "lucide-react"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar"

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

const SidebarGroupLabel: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`mt-4 px-3 py-1 text-xs font-semibold uppercase text-muted-foreground ${className || ""}`}>
    {children}
  </div>
);

export function NavMain({
  navGroups,
  adminItem,
}: {
  navGroups: NavItemGroup[]
  adminItem?: NavItem
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        {navGroups.map((group) => (
          <React.Fragment key={group.groupTitle}>
            <SidebarGroupLabel>{group.groupTitle}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.name}
                  >
                    <Link href={item.href}>
                      {item.icon && <item.icon className="h-5 w-5" />}
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </React.Fragment>
        ))}
        {adminItem && (
          <React.Fragment key={adminItem.href}>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === adminItem.href}
                  tooltip={adminItem.name}
                >
                  <Link href={adminItem.href}>
                    {adminItem.icon && <adminItem.icon className="h-5 w-5" />}
                    <span>{adminItem.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </React.Fragment>
        )}
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
