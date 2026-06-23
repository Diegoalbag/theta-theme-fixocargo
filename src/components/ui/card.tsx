import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils";

const cardVariants = cva("rounded-[16px] p-6", {
  variants: {
    variant: {
      surface: "bg-card text-card-foreground border border-border",
      "navy-dark": "bg-brand-navy text-white",
    },
  },
  defaultVariants: {
    variant: "surface",
  },
})

export interface CardProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof cardVariants> {}

function Card({ className, variant, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ variant, className }))}
      {...props}
    />
  )
}

export { Card, cardVariants }
