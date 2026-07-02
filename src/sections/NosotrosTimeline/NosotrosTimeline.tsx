import * as React from "react";

import { BlocksSlot } from "@/lib/blocks-slot";

// NosotrosTimeline (NOS-05, D-04) — the "De una idea a una red" vertical
// timeline band. A light band with an INLINE centered header (eyebrow + display
// title, each guarded — NOT SectionHeading, per RESEARCH Pitfall 2) over a
// single BlocksSlot of section-local `timeline-item` blocks.
//
// The vertical connector is drawn on the BlocksSlot wrapper via
// `border-l-2 border-brand-yellow` on a `flex flex-col gap-4 pl-6` container —
// NEVER an `absolute`ly-positioned line and never a bracketed-coordinate rule.
// Layout classes live on the wrapper className only. The default BlocksSlot
// EmptyState is KEPT (do NOT pass empty={null}) so a zero-item timeline shows
// "Sin elementos", never a blank gap (D-04).
//
// Single-column vertical rail — no decorative image field (keeps the
// coordinate-free connector proof clean; the optional image is out of scope).
//
// No state, no event handlers, no hex literals, @/ imports only.
export interface NosotrosTimelineProps {
  eyebrow?: string;
  heading?: string;
  renderBlocks?: () => React.ReactNode;
  sectionId?: string;
  sectionName?: string;
}

export const NosotrosTimeline = ({
  eyebrow = "Nuestra historia",
  heading = "De una idea a una red",
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
            <h2 className="font-display text-3xl italic text-brand-navy lg:text-5xl">
              {heading}
            </h2>
          )}
        </div>

        <BlocksSlot
          renderBlocks={renderBlocks}
          className="mt-8 flex flex-col gap-4 border-l-2 border-brand-yellow pl-6"
        />
      </div>
    </section>
  );
};

// Exactly 2 editable fields, ids → camelCase props.
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
];
