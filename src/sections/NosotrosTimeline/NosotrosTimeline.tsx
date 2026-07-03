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
// that paints ON TOP OF the cards (not in a left gutter): the column is a
// `relative` positioning context and the line is an `aria-hidden` sibling
// BEFORE BlocksSlot with
// `pointer-events-none absolute left-6 top-2 bottom-2 z-10 w-0.5 bg-brand-yellow`.
// `z-10` lifts the line above the full-width cards so it reads over each card
// surface and runs continuously through the gaps into the next card; `left-6`
// (24px) centers the 2px line on the dot that lives INSIDE each card. Each
// TimelineItem dot sits on top of the line at `z-20` with a card-colored halo.
// This is the user-directed over-the-card treatment (deviates from the shipped
// gutter-rail design). The default BlocksSlot EmptyState is KEPT (do NOT pass
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
              className="pointer-events-none absolute left-6 top-2 bottom-2 z-10 w-0.5 bg-brand-yellow"
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
