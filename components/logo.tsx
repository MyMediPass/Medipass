import Link from "next/link"
import { cn } from "@/lib/utils"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  variant?: "default" | "white"
  className?: string
  linkWrapper?: boolean
}

export function Logo({ size = "md", variant = "default", className, linkWrapper = true }: LogoProps) {
  const sizeClasses = {
    sm: "h-6",
    md: "h-8",
    lg: "h-10",
  }

  const logoContent = (
    <div className={cn("relative", sizeClasses[size])}>
      <div className="flex items-center">
        <div className="rounded-full bg-primary/10 p-1 mr-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("text-primary", size === "sm" ? "h-4 w-4" : size === "md" ? "h-5 w-5" : "h-6 w-6")}
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            <path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08v0c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66" />
            <path d="m18 15-2-2" />
            <path d="m15 18-2-2" />
          </svg>
        </div>
        <span
          className={cn(
            "font-bold tracking-tight",
            variant === "white" ? "text-white" : "text-primary",
            size === "sm" ? "text-lg" : size === "md" ? "text-xl" : "text-2xl",
          )}
        >
          MediPass
        </span>
      </div>
    </div>
  )

  return <div className={cn("flex items-center", className)}>{logoContent}</div>
}
