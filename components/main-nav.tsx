"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useUser } from "@/components/user-provider"
import { Button } from "@/components/ui/button"
import { Logo } from "./logo"

interface MainNavProps extends React.HTMLAttributes<HTMLElement> {
  items?: {
    title: string
    href: string
    disabled?: boolean
  }[]
}

export function MainNav({ className, items, ...props }: MainNavProps) {
  const pathname = usePathname()
  const { user, signOut } = useUser()

  return (
    <div className="mr-4 hidden md:flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <Logo />
      </Link>
      <nav className={cn("flex items-center space-x-6 text-sm font-medium", className)} {...props}>
        {items?.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "transition-colors hover:text-foreground/80",
              pathname === item.href ? "text-foreground" : "text-foreground/60",
              item.disabled && "cursor-not-allowed opacity-60"
            )}
          >
            {item.title}
          </Link>
        ))}
      </nav>
      <div className="ml-auto flex items-center space-x-4">
        {user ? (
          <Button variant="outline" onClick={() => signOut()}>
            Sign out
          </Button>
        ) : (
          <Button asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        )}
      </div>
    </div>
  )
}
