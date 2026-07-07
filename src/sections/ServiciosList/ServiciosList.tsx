import * as React from "react";

import { BlocksSlot } from "@/lib/blocks-slot";

// ServiciosList (quick task 260707-etz) — the FixoCargo "Servicios" page list
// band. Mirrors BeneficiosGrid's left-aligned inline eyebrow+heading header
// shape (yellow eyebrow, navy display-italic heading) — plain <p>/<h2> tags,
// NOT SectionHeading, since SectionHeading bakes a non-yellow eyebrow — over a
// responsive 1→2→3-up grid wrapping a SINGLE BlocksSlot of the section-local
// `service-card` block. The default BlocksSlot EmptyState is KEPT (do NOT
// pass empty={null}) so a zero-card section shows "Sin elementos" instead of
// a blank gap. Layout lives on the wrapper className only, never on the slot.
//
// No state, no event handlers, no hex literals, @/ imports only.
export interface ServiciosListProps {
  eyebrow?: string;
  heading?: string;
  renderBlocks?: () => React.ReactNode;
  sectionId?: string;
  sectionName?: string;
}

export const ServiciosList = ({
  eyebrow = "Lo que hacemos",
  heading = "Un servicio para cada envío",
  renderBlocks,
}: ServiciosListProps): React.ReactNode => {
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
          className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        />
      </div>
    </section>
  );
};

// Exactly 2 editable fields, ids → camelCase props.
export const serviciosListSettingsSchema = [
  {
    id: "eyebrow",
    label: "Etiqueta superior",
    type: "text",
    default: "Lo que hacemos",
  },
  {
    id: "heading",
    label: "Título",
    type: "text",
    default: "Un servicio para cada envío",
  },
];
