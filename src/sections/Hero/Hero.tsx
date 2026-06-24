import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { BlocksSlot } from "@/lib/blocks-slot";

// Hero (ATF-01) — above-the-fold scroll-snap carousel of hero-slide blocks.
//
// No-JS CSS scroll-snap track (RESEARCH Pattern 1): BlocksSlot is called EXACTLY
// ONCE as the snap track. Each child hero-slide carries `snap-start w-full
// shrink-0`, so multiple slides form a horizontal swipeable track and a single
// slide is identical to the static design. Zero slides falls through to the
// default BlocksSlot EmptyState (D-10 — content sections keep the dashed drop
// affordance; we do NOT pass empty={null}).
//
// Arrows and dots are DECORATIVE (aria-hidden): anchor arrows would cause a
// vertical jump (Pitfall 1) and the slide count is unknowable statelessly
// (Pitfall 2), so dots are a static row with the first dot active to match the
// design quirk. No autoplay, no scroll tracking, no state, no event handlers.
export interface HeroProps {
  renderBlocks?: () => React.ReactNode;
  sectionId?: string;
  sectionName?: string;
}

export const Hero = ({ renderBlocks }: HeroProps): React.ReactNode => {
  return (
    <section role="region" aria-label="Carrusel destacado" className="relative">
      {/* Single BlocksSlot as the no-JS scroll-snap track (D-01, Pattern 1).
          Default EmptyState kept (D-10). */}
      <BlocksSlot
        renderBlocks={renderBlocks}
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden motion-reduce:scroll-auto"
      />

      {/* Decorative arrows (D-03 → decorative per Pitfall 1; NOT anchors). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-4 hidden items-center md:flex"
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-black/20 text-white">
          <ChevronLeft aria-hidden="true" className="size-5" />
        </span>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-4 hidden items-center md:flex"
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-black/20 text-white">
          <ChevronRight aria-hidden="true" className="size-5" />
        </span>
      </div>

      {/* Decorative dots (D-02 → static row; count unknowable statelessly).
          First dot filled, the other two outline (design quirk: first active). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-6 flex items-center justify-center gap-2"
      >
        <span className="size-[14px] rounded-full bg-brand-yellow" />
        <span className="size-[14px] rounded-full border border-white/70" />
        <span className="size-[14px] rounded-full border border-white/70" />
      </div>
    </section>
  );
};

// No editable section-level settings — all editable content lives on the
// hero-slide blocks (D-04: background is per-slide, not section-level).
export const heroSettingsSchema = [];
