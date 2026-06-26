import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const sectionHeadingVariants = cva("flex flex-col gap-2", {
  variants: {
    variant: {
      light: "text-brand-navy",
      dark: "text-white",
    },
  },
  defaultVariants: {
    variant: "light",
  },
});

// Small kicker ABOVE the title.
const eyebrowVariants = cva("font-gotham text-sm font-light tracking-wide", {
  variants: {
    variant: {
      light: "text-brand-navy",
      dark: "text-white",
    },
  },
  defaultVariants: {
    variant: "light",
  },
});

// Supporting line BELOW the title (the text formerly carried by `eyebrow`).
const subtitleVariants = cva("font-gill text-lg font-bold tracking-wide", {
  variants: {
    variant: {
      light: "text-brand-navy",
      dark: "text-brand-white",
    },
  },
  defaultVariants: {
    variant: "light",
  },
});

export interface SectionHeadingProps
  extends
    Omit<React.ComponentProps<"div">, "title">,
    VariantProps<typeof sectionHeadingVariants> {
  /** Small kicker rendered ABOVE the title. */
  eyebrow?: string;
  title: string;
  /** Supporting line rendered BELOW the title. */
  subtitle?: string;
  cta?: React.ReactNode;
}

function SectionHeading({
  className,
  variant,
  eyebrow,
  title,
  subtitle,
  cta,
  ...props
}: SectionHeadingProps) {
  return (
    <div data-slot="section-heading" className={className} {...props}>
      <div className={cn(sectionHeadingVariants({ variant }))}>
        {eyebrow && (
          <p className={cn(eyebrowVariants({ variant }))}>{eyebrow}</p>
        )}
        <h2 className="font-aku text-3xl leading-tight font-bold lg:text-7xl">
          {title}
        </h2>
        {subtitle && (
          <p className={cn(subtitleVariants({ variant }))}>{subtitle}</p>
        )}
      </div>
      {cta && <div className="mt-2">{cta}</div>}
    </div>
  );
}

export { SectionHeading, sectionHeadingVariants };
