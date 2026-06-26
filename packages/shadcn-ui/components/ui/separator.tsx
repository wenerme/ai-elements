"use client"

import * as React from "react"
import { Separator as SeparatorPrimitive } from "@repo/shadcn-ui/lib/base-ui"

import { cn } from "@repo/shadcn-ui/lib/utils"

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  const separatorProps = decorative
    ? { role: "none" }
    : { "aria-orientation": orientation, role: "separator" }

  return (
    <SeparatorPrimitive.Root
      data-orientation={orientation}
      data-slot="separator"
      {...separatorProps}
      className={cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className
      )}
      {...props}
    />
  )
}

export { Separator }
