import * as React from "react";

import { BlocksSlot } from "@/lib/blocks-slot";

// AppFeatures (quick task 260706-qqi) — the FixoCargo "Todo desde la app" dark
// band. Mirrors BeneficiosGrid's left-aligned inline eyebrow+heading header
// shape but on the navy dark band: yellow eyebrow, WHITE display-italic
// heading. A responsive 1→2→3-up grid wraps a SINGLE BlocksSlot of
// section-local `app-feature-item` blocks (static icon+text rows). The default
// BlocksSlot EmptyState is KEPT (do NOT pass empty={null}) so a zero-item
// section shows "Sin elementos" instead of a blank gap. Layout lives on the
// wrapper className only, never on the slot.
//
// No state, no event handlers, no hex literals, @/ imports only.
export interface AppFeaturesProps {
  eyebrow?: string;
  heading?: string;
  renderBlocks?: () => React.ReactNode;
  sectionId?: string;
  sectionName?: string;
}

export const AppFeatures = ({
  eyebrow = "Todo desde la app",
  heading = "Controla tus envíos en tiempo real",
  renderBlocks,
}: AppFeaturesProps): React.ReactNode => {
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

        <BlocksSlot
          renderBlocks={renderBlocks}
          className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        />
      </div>
    </section>
  );
};

// Exactly 2 editable fields, ids → camelCase props.
export const appFeaturesSettingsSchema = [
  {
    id: "eyebrow",
    label: "Etiqueta superior",
    type: "text",
    default: "Todo desde la app",
  },
  {
    id: "heading",
    label: "Título",
    type: "text",
    default: "Controla tus envíos en tiempo real",
  },
];
