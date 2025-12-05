import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

const NativeSelect = React.forwardRef(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 appearance-none pr-8",
            "aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
      </div>
    )
  }
)
NativeSelect.displayName = "NativeSelect"

const NativeSelectOption = React.forwardRef(
  ({ className, ...props }, ref) => {
    return <option ref={ref} className={cn("", className)} {...props} />
  }
)
NativeSelectOption.displayName = "NativeSelectOption"

const NativeSelectOptGroup = React.forwardRef(
  ({ className, ...props }, ref) => {
    return <optgroup ref={ref} className={cn("", className)} {...props} />
  }
)
NativeSelectOptGroup.displayName = "NativeSelectOptGroup"

export { NativeSelect, NativeSelectOption, NativeSelectOptGroup }

