"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css";

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      style={{
        "--rdp-accent-color": "hsl(165 70% 25%)",
        "--rdp-background-color": "hsl(165 70% 25%)",
        "--rdp-accent": "hsl(165 70% 25%)",
        "--rdp-selected": "hsl(165 70% 25%)",
        "--rdp-hover": "hsl(165 70% 25%)",
      }}
      components={{
        IconLeft: ({ className: iconClassName }: { className?: string }) => (
          <ChevronLeft className={cn("h-4 w-4", iconClassName)} />
        ),
        IconRight: ({ className: iconClassName }: { className?: string }) => (
          <ChevronRight className={cn("h-4 w-4", iconClassName)} />
        ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
