import * as React from "react";

import { BlocksSlot } from "@/lib/blocks-slot";

// CargaAereaRates (RAT-01, D-11-03) — the Carga Aérea rate presentation band.
// Mirrors ServiciosList's left-aligned inline eyebrow+heading header shape
// (yellow eyebrow, navy display-italic heading) over a responsive 1→2→3-up grid
// wrapping a SINGLE block slot of the section-local `rate-card` block.
//
// Unlike courier-tabs, this grid DOES carry a `gap`: no card here is ever
// CSS-hidden, so there are no phantom gaps to avoid. The default empty state is
// KEPT — a zero-card section shows "Sin elementos" instead of a blank gap.
// Layout lives on the wrapper className only, never on the slot; the slot's
// return value is never inspected.
//
// No state, no event handlers, no hex literals, @/ imports only.
export interface CargaAereaRatesProps {
  eyebrow?: string;
  heading?: string;
  renderBlocks?: () => React.ReactNode;
  sectionId?: string;
  sectionName?: string;
}

export const CargaAereaRates = ({
  eyebrow = "Carga Aérea",
  heading = "Tarifas por ruta",
  renderBlocks,
}: CargaAereaRatesProps): React.ReactNode => {
  return (
    <section className="bg-transparent section-padding-y">
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

// Exactly 2 editable fields, ids → camelCase props. Short, generic Spanish
// placeholders following the ServiciosList precedent — never a value lifted from
// .planning/CONTENT-CHECKLIST.md.
export const cargaAereaRatesSettingsSchema = [
  {
    id: "eyebrow",
    label: "Etiqueta superior",
    type: "text",
    default: "Carga Aérea",
  },
  {
    id: "heading",
    label: "Título",
    type: "text",
    default: "Tarifas por ruta",
  },
];
