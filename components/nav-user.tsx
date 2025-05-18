"use client"

import {
  BellIcon,
  CreditCardIcon,
  LogOutIcon,
  MoreVerticalIcon,
  UserCircleIcon,
} from "lucide-react"
import Link from "next/link"
import type { UserResource, EmailAddressResource } from "@clerk/types"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavUser({
  user,
  onSignOut,
}: {
  user: Pick<UserResource, 'firstName' | 'fullName' | 'hasImage' | 'imageUrl' | 'primaryEmailAddressId'> & { emailAddresses: EmailAddressResource[] }
  onSignOut?: () => void
}) {
  const { isMobile } = useSidebar()

  const displayFirstName = user.firstName || "User"
  const displayFullName = user.fullName || (user.primaryEmailAddressId && user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress) || "Anonymous User"
  const primaryEmail = user.primaryEmailAddressId ? user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress : (user.emailAddresses.length > 0 ? user.emailAddresses[0].emailAddress : "No email")

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.imageUrl} alt={displayFirstName} />
                <AvatarFallback className="rounded-lg">
                  {displayFirstName?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="font-medium truncate">{displayFullName}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {primaryEmail}
                </span>
              </div>
              <MoreVerticalIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.imageUrl} alt={displayFirstName} />
                  <AvatarFallback className="rounded-lg">
                    {displayFirstName?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="font-medium truncate">{displayFullName}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {primaryEmail}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link href={process.env.NEXT_PUBLIC_CLERK_USER_PROFILE_URL || "/user-profile"} passHref>
                <DropdownMenuItem>
                  <UserCircleIcon className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem>
                <CreditCardIcon className="mr-2 h-4 w-4" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BellIcon className="mr-2 h-4 w-4" />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onSignOut} disabled={!onSignOut}>
              <LogOutIcon className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
