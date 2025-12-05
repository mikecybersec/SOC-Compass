import * as React from "react"

import { cn } from "@/lib/utils"

const ButtonGroup = React.forwardRef(
  ({ className, orientation = "horizontal", ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="group"
        data-orientation={orientation}
        className={cn(
          "inline-flex items-center",
          orientation === "horizontal"
            ? "flex-row [&>*:not(:last-child)]:rounded-r-none [&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:-ml-px"
            : "flex-col [&>*:not(:last-child)]:rounded-b-none [&>*:not(:first-child)]:rounded-t-none [&>*:not(:first-child)]:-mt-px",
          className
        )}
        {...props}
      />
    )
  }
)
ButtonGroup.displayName = "ButtonGroup"

const ButtonGroupSeparator = React.forwardRef(
  ({ className, orientation = "vertical", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-border",
          orientation === "vertical" ? "h-4 w-[1px]" : "h-[1px] w-4",
          className
        )}
        {...props}
      />
    )
  }
)
ButtonGroupSeparator.displayName = "ButtonGroupSeparator"

const ButtonGroupText = React.forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center whitespace-nowrap px-3 text-sm text-muted-foreground",
          className
        )}
        {...props}
      />
    )
  }
)
ButtonGroupText.displayName = "ButtonGroupText"

export { ButtonGroup, ButtonGroupSeparator, ButtonGroupText }

