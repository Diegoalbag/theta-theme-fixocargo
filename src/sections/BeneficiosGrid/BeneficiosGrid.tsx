import * as React from "react";

import { BlocksSlot } from "@/lib/blocks-slot";

// BeneficiosGrid (quick task 260706-qqi) — the FixoCargo "Beneficios" page grid
// band. A LEFT-ALIGNED inline eyebrow+heading header (yellow eyebrow, navy
// display-italic title) — plain <p>/<h2> tags, NOT SectionHeading, since
// SectionHeading bakes a non-yellow eyebrow (RESEARCH Pitfall 2) — over a
// responsive 1→2→4-up grid wrapping a SINGLE BlocksSlot of the promoted GLOBAL
// `benefit-card` block (reused, not duplicated, from the original Beneficios
// section). The default BlocksSlot EmptyState is KEPT (do NOT pass
// empty={null}) so a zero-card section shows "Sin elementos" instead of a
// blank gap. Layout lives on the wrapper className only, never on the slot.
//
// No state, no event handlers, no hex literals, @/ imports only.
export interface BeneficiosGridProps {
  eyebrow?: string;
  heading?: string;
  renderBlocks?: () => React.ReactNode;
  sectionId?: string;
  sectionName?: string;
}

export const BeneficiosGrid = ({
  eyebrow = "Nuestros beneficios",
  heading = "Pensados para que envíes tranquilo",
  renderBlocks,
}: BeneficiosGridProps): React.ReactNode => {
  return (
    <section className="bg-background section-padding-y">
      <div className="container mx-auto container-padding-x">
        <div className="flex flex-col items-start gap-3">
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
          className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        />
      </div>
    </section>
  );
};

// Exactly 2 editable fields, ids → camelCase props.
export const beneficiosGridSettingsSchema = [
  {
    id: "eyebrow",
    label: "Etiqueta superior",
    type: "text",
    default: "Nuestros beneficios",
  },
  {
    id: "heading",
    label: "Título",
    type: "text",
    default: "Pensados para que envíes tranquilo",
  },
];
