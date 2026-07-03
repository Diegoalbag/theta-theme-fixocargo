import * as React from "react";

import { BlocksSlot } from "@/lib/blocks-slot";
import { ImageGuard } from "@/lib/image-guard";

// NosotrosTimeline (NOS-05, D-04) — the "De una idea a una red" HISTORY band.
// A light band with an INLINE centered header (eyebrow + display title, each
// guarded — NOT SectionHeading, per RESEARCH Pitfall 2) over a responsive
// 2-column row: the timeline rail on the LEFT and a tall rounded IMAGE banner
// on the RIGHT (per the FixoCargo HISTORY screenshot).
//
// The vertical connector is a SOLID yellow line drawn as an absolute OVERLAY
// over the rail column: the column is a `relative` positioning context and the
// line is an `aria-hidden` sibling BEFORE BlocksSlot with
// `pointer-events-none absolute left-[7px] top-3.5 bottom-10 w-0.5 bg-brand-yellow`.
// The bracketed `left-[7px]` is intentional and authorized — it centers the 2px
// line under the 16px dot (whose center sits at 8px). The line renders behind
// the dots by DOM order; each dot's `ring-muted` halo punches the gap. This
// matches the shipped FixoCargo HISTORY design and the sidebar-nav overlay
// technique. The default BlocksSlot EmptyState is KEPT (do NOT pass
// empty={null}) so a zero-item timeline shows "Sin elementos", never a blank
// gap (D-04).
//
// The banner is an ImageGuard inside a rounded card — coordinate-free: the
// 2-column split uses fraction widths (`lg:w-3/5` / `lg:w-2/5`) and the image
// height comes from ImageGuard's numeric `ratio` prop, never a bracketed px.
// Mobile stacks (`flex-col`) timeline-then-banner; nothing is hidden.
//
// No state, no event handlers, no hex literals, @/ imports only.
export interface NosotrosTimelineProps {
  eyebrow?: string;
  heading?: string;
  bannerImage?: {
    id: string;
    url?: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  renderBlocks?: () => React.ReactNode;
  sectionId?: string;
  sectionName?: string;
}

export const NosotrosTimeline = ({
  eyebrow = "Nuestra historia",
  heading = "De una idea a una red",
  bannerImage,
  renderBlocks,
}: NosotrosTimelineProps): React.ReactNode => {
  return (
    <section className="bg-muted section-padding-y">
      <div className="container mx-auto container-padding-x">
        <div className="flex flex-col items-center text-center">
          {eyebrow && (
            <p className="font-gotham text-sm uppercase tracking-wide text-brand-yellow">
              {eyebrow}
            </p>
          )}
          {heading && (
            <h2 className="font-aku text-3xl italic text-brand-navy lg:text-5xl">
              {heading}
            </h2>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
          <div className="relative lg:w-3/5">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-[7px] top-3.5 bottom-10 w-0.5 bg-brand-yellow"
            />
            <BlocksSlot
              renderBlocks={renderBlocks}
              className="flex flex-col gap-4"
            />
          </div>
          <div className="lg:w-2/5">
            <div className="overflow-hidden rounded-3xl bg-card shadow-lg">
              <ImageGuard
                url={bannerImage?.url}
                alt={bannerImage?.alt}
                ratio={760 / 900}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Exactly 3 editable fields, ids → camelCase props.
export const nosotrosTimelineSettingsSchema = [
  {
    id: "eyebrow",
    label: "Etiqueta superior",
    type: "text",
    default: "Nuestra historia",
  },
  {
    id: "heading",
    label: "Título",
    type: "text",
    default: "De una idea a una red",
  },
  {
    id: "bannerImage",
    label: "Imagen lateral",
    type: "image_picker",
    default: undefined,
  },
];
