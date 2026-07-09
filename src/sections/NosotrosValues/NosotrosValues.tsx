import * as React from "react";

import { BlocksSlot } from "@/lib/blocks-slot";

// NosotrosValues (NOS-04, D-04) — the "Nuestros valores" light band. A centered
// INLINE band header (yellow eyebrow + display-italic navy title) over a
// responsive 1→2→3-up grid wrapping a SINGLE BlocksSlot of section-local
// `value-card` blocks. The default BlocksSlot EmptyState is KEPT (do NOT pass
// empty={null}) so a zero-card section shows "Sin elementos" instead of a blank
// gap (D-04). Layout lives on the wrapper className only, never on the slot.
//
// The header is inline (NOT SectionHeading) because SectionHeading bakes a
// non-yellow eyebrow; this wants a font-aku italic title and a
// text-brand-yellow eyebrow (RESEARCH Pitfall 2).
//
// No state, no event handlers, no hex literals, @/ imports only.
export interface NosotrosValuesProps {
  eyebrow?: string;
  heading?: string;
  renderBlocks?: () => React.ReactNode;
  sectionId?: string;
  sectionName?: string;
}

export const NosotrosValues = ({
  eyebrow = "Lo que nos mueve",
  heading = "Nuestros valores",
  renderBlocks,
}: NosotrosValuesProps): React.ReactNode => {
  return (
    <section className="bg-transparent section-padding-y">
      <div className="container mx-auto container-padding-x">
        <div className="flex flex-col items-center text-center">
          {eyebrow && (
            <p className="font-gotham text-brand-yellow text-sm uppercase tracking-wide">
              {eyebrow}
            </p>
          )}
          {heading && (
            <h2 className="font-aku italic text-brand-navy text-3xl lg:text-5xl">
              {heading}
            </h2>
          )}
        </div>

        <BlocksSlot
          renderBlocks={renderBlocks}
          className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        />
      </div>
    </section>
  );
};

// Exactly 2 editable fields, ids → camelCase props. Spanish defaults per
// UI-SPEC Copywriting Contract.
export const nosotrosValuesSettingsSchema = [
  {
    id: "eyebrow",
    label: "Etiqueta superior",
    type: "text",
    default: "Lo que nos mueve",
  },
  {
    id: "heading",
    label: "Título",
    type: "text",
    default: "Nuestros valores",
  },
];
