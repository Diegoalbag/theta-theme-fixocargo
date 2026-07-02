import * as React from "react";

import { BlocksSlot } from "@/lib/blocks-slot";

// NosotrosStats (NOS-03, D-04) — the full-bleed navy stats band from the
// FixoCargo About design. A single BlocksSlot of section-local `stat-item`
// blocks (number-as-text + label) that stacks on mobile and divides into
// columns on larger screens. Dividers are drawn ENTIRELY on the BlocksSlot
// wrapper children (mobile `divide-y`, desktop left border) — never an <hr>,
// never absolute positioning (coordinate-free). The default BlocksSlot
// EmptyState is KEPT (do NOT pass empty={null}) so a zero-item section shows
// "Sin elementos" instead of a blank navy band (D-04).
//
// The optional band header is guarded and defaults empty so the design's bare
// stat bar is preserved; a merchant may add an eyebrow + heading.
//
// No state, no event handlers, no hex literals, @/ imports only.
export interface NosotrosStatsProps {
  eyebrow?: string;
  heading?: string;
  renderBlocks?: () => React.ReactNode;
  sectionId?: string;
  sectionName?: string;
}

export const NosotrosStats = ({
  eyebrow = "",
  heading = "",
  renderBlocks,
}: NosotrosStatsProps): React.ReactNode => {
  return (
    <section className="bg-brand-navy section-padding-y">
      <div className="container mx-auto container-padding-x">
        {eyebrow && (
          <p className="font-gotham text-sm tracking-wide uppercase text-brand-yellow">
            {eyebrow}
          </p>
        )}
        {heading && (
          <h2 className="font-display italic text-white text-3xl lg:text-5xl">
            {heading}
          </h2>
        )}

        <BlocksSlot
          renderBlocks={renderBlocks}
          className="mt-8 flex flex-col divide-y divide-white/12 sm:flex-row sm:divide-y-0 [&>*:not(:first-child)]:sm:border-l [&>*:not(:first-child)]:sm:border-white/12"
        />
      </div>
    </section>
  );
};

// Exactly 2 editable fields, ids → camelCase props. Both default "" so the bare
// navy stat bar is preserved; the merchant may add a band header.
export const nosotrosStatsSettingsSchema = [
  {
    id: "eyebrow",
    label: "Etiqueta superior",
    type: "text",
    default: "",
  },
  {
    id: "heading",
    label: "Título",
    type: "text",
    default: "",
  },
];
