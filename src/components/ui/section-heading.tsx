import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils";

const sectionHeadingVariants = cva("flex flex-col gap-3", {
  variants: {
    variant: {
      light: "text-brand-navy",
      dark: "text-white",
    },
  },
  defaultVariants: {
    variant: "light",
  },
})

const eyebrowVariants = cva(
  "font-gotham text-sm font-bold uppercase tracking-wide",
  {
    variants: {
      variant: {
        light: "text-brand-navy",
        dark: "text-brand-yellow",
      },
    },
    defaultVariants: {
      variant: "light",
    },
  }
)

export interface SectionHeadingProps
  extends Omit<React.ComponentProps<"div">, "title">,
    VariantProps<typeof sectionHeadingVariants> {
  eyebrow?: string
  title: string
  cta?: React.ReactNode
}

function SectionHeading({
  className,
  variant,
  eyebrow,
  title,
  cta,
  ...props
}: SectionHeadingProps) {
  return (
    <div
      data-slot="section-heading"
      className={cn(sectionHeadingVariants({ variant, className }))}
      {...props}
    >
      {eyebrow && <p className={cn(eyebrowVariants({ variant }))}>{eyebrow}</p>}
      <h2 className="font-display text-3xl leading-tight font-bold lg:text-5xl">
        {title}
      </h2>
      {cta && <div className="mt-2">{cta}</div>}
    </div>
  )
}

export { SectionHeading, sectionHeadingVariants }
