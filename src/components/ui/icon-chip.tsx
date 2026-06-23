import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils";

const iconChipVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-full [&_svg]:shrink-0",
  {
    variants: {
      size: {
        sm: "size-8 [&_svg]:size-4",
        md: "size-11 [&_svg]:size-5",
        lg: "size-14 [&_svg]:size-7",
      },
      background: {
        surface: "bg-muted text-brand-navy",
        navy: "bg-brand-navy text-white",
        yellow: "bg-brand-yellow text-brand-navy",
      },
    },
    defaultVariants: {
      size: "md",
      background: "surface",
    },
  }
)

export interface IconChipProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof iconChipVariants> {}

function IconChip({
  className,
  size,
  background,
  children,
  ...props
}: IconChipProps) {
  return (
    <span
      data-slot="icon-chip"
      className={cn(iconChipVariants({ size, background, className }))}
      {...props}
    >
      {children}
    </span>
  )
}

export { IconChip, iconChipVariants }
