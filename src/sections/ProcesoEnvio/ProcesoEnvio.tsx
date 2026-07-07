import * as React from "react";

import { BlocksSlot } from "@/lib/blocks-slot";

// ProcesoEnvio (quick task 260707-etz) — the FixoCargo "Servicios" page
// "¿Cómo funciona tu envío?" dark band. Mirrors the left-aligned inline
// eyebrow+heading header shape (same as ServiciosList/AppFeatures) on the
// bg-brand-navy dark band. Below the header, a responsive 1→2→4-up grid
// wraps a SINGLE BlocksSlot of the section-local `process-step` block, with a
// SECTION-OWNED horizontal connector overlay (mirrors the NosotrosTimeline
// pattern — a single overlay, not per-block CSS, because the customizer
// wraps every block individually and defeats `:last-child` tricks). The
// default BlocksSlot EmptyState is KEPT (do NOT pass empty={null}). Layout
// lives on the wrapper className only, never on the slot.
//
// No state, no event handlers, no hex literals, @/ imports only.
export interface ProcesoEnvioProps {
  eyebrow?: string;
  heading?: string;
  renderBlocks?: () => React.ReactNode;
  sectionId?: string;
  sectionName?: string;
}

export const ProcesoEnvio = ({
  eyebrow = "#FixoTeGuía",
  heading = "¿Cómo funciona tu envío?",
  renderBlocks,
}: ProcesoEnvioProps): React.ReactNode => {
  return (
    <section className="bg-brand-navy section-padding-y">
      <div className="container mx-auto container-padding-x">
        <div className="flex flex-col items-start gap-3">
          {eyebrow && (
            <p className="font-gotham text-brand-yellow text-sm uppercase tracking-wide">
              {eyebrow}
            </p>
          )}
          {heading && (
            <h2 className="font-aku italic text-white text-3xl lg:text-5xl">
              {heading}
            </h2>
          )}
        </div>

        <div className="relative mt-10 lg:mt-14">
          {/* Section-owned horizontal connector — a SINGLE overlay, not a
              per-block CSS trick (the customizer wraps every block
              individually, defeating :last-child). `top-7` (28px) centers on
              ProcessStep's size-14 (56px) circle; `hidden lg:block` because
              the line only makes sense once the grid is a single-row 4-col
              layout — it must NOT show at 1/2-column widths. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-7 z-0 hidden h-px bg-white/10 lg:block"
          />
          {/* `relative z-10` is required here: an absolutely-positioned
              sibling paints ABOVE static-flow siblings by default stacking
              order, so without this the decorative line would incorrectly
              paint over the step circles. */}
          <BlocksSlot
            renderBlocks={renderBlocks}
            className="relative z-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8"
          />
        </div>
      </div>
    </section>
  );
};

// Exactly 2 editable fields, ids → camelCase props.
export const procesoEnvioSettingsSchema = [
  {
    id: "eyebrow",
    label: "Etiqueta superior",
    type: "text",
    default: "#FixoTeGuía",
  },
  {
    id: "heading",
    label: "Título",
    type: "text",
    default: "¿Cómo funciona tu envío?",
  },
];
