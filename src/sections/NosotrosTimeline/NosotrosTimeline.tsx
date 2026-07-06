import * as React from "react";

import { BlocksSlot } from "@/lib/blocks-slot";
import { ImageGuard } from "@/lib/image-guard";

// NosotrosTimeline (NOS-05, D-04) — the "De una idea a una red" HISTORY band.
// A light band with an INLINE centered header (eyebrow + display title, each
// guarded — NOT SectionHeading, per RESEARCH Pitfall 2) over a responsive
// 2-column row: the timeline rail on the LEFT and a tall rounded IMAGE banner
// on the RIGHT (per the FixoCargo HISTORY screenshot).
//
// The vertical connector is a DOTTED yellow line drawn as a SINGLE absolute
// OVERLAY that paints ON TOP OF the cards (not a left-gutter rail): the column
// is a `relative` context and the line is an `aria-hidden` sibling BEFORE
// BlocksSlot with `pointer-events-none absolute left-6 top-8 bottom-28 z-10
// border-l-2 border-dotted border-brand-yellow`. `z-10` lifts it over the
// full-width cards; `left-6` (24px) centers it on the in-card dots; each
// TimelineItem dot sits on top at `z-20`. `top-8` (32px) pins the line to start
// exactly at the FIRST dot (deterministic — first card is at column top). The
// `bottom-28` inset trims the tail near the LAST dot; it is a FIXED estimate,
// not exact, because a single overlay cannot locate the last dot's y — the
// blocks are stateless (no index) and the customizer wraps each block, so CSS
// `:last-child` matches every item and can't mark the last. Nudge `bottom-28`
// if the timeline's last-card height changes. The default BlocksSlot EmptyState
// is KEPT (do NOT pass empty={null}) so a zero-item timeline shows "Sin
// elementos", never a blank gap (D-04).
//
// The banner is a fill-mode ImageGuard inside a rounded card. The 2-column
// split is equal-width (`lg:w-1/2` each) and the row is NOT `items-start`, so
// on desktop both columns stretch to the same height and the banner card's
// `lg:h-full` fills the timeline's height (the ImageGuard `fill` image covers
// it, object-cover). On mobile the columns stack (`flex-col`) and the card
// falls back to an `aspect-[3/4]` box so it can't collapse without a column
// height to fill. Nothing is hidden.
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

        <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:gap-12">
          <div className="relative lg:w-1/2">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-6 top-8 bottom-28 z-10 border-l-2 border-dotted border-brand-yellow"
            />
            <BlocksSlot
              renderBlocks={renderBlocks}
              className="flex flex-col gap-4"
            />
          </div>
          <div className="lg:w-1/2">
            <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-card shadow-lg lg:aspect-auto lg:h-full">
              <ImageGuard url={bannerImage?.url} alt={bannerImage?.alt} fill />
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
