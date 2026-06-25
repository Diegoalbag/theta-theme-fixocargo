import * as React from "react";

import { SectionHeading } from "@/components/ui/section-heading";
import { BlocksSlot } from "@/lib/blocks-slot";

// Servicios (SVC-01) — the off-white services band. A SectionHeading
// (light variant) over a SINGLE BlocksSlot that holds BOTH section-local block
// types (service-item + promo-banner) in ONE ordered slot (D-02/D-03): the host
// exposes one slot and the theme cannot partition children by blockType, so the
// blocks flow in editor order. The two-column desktop look is purely the CSS
// grid on the BlocksSlot wrapper className (layout NEVER on the slot — Pitfall
// 4). The default BlocksSlot EmptyState is KEPT (do NOT pass empty={null}, D-07)
// so a zero-block section shows "Sin elementos" instead of a blank gap.
//
// No state, no event handlers, no hex literals, @/ imports only.
export interface ServiciosProps {
  heading?: string;
  subtitle?: string;
  renderBlocks?: () => React.ReactNode;
  sectionId?: string;
  sectionName?: string;
}

export const Servicios = ({
  heading,
  subtitle,
  renderBlocks,
}: ServiciosProps): React.ReactNode => {
  return (
    <section className="bg-background section-padding-y">
      <div className="container mx-auto container-padding-x">
        <SectionHeading
          title={heading ?? "Nuestros Servicios"}
          eyebrow={
            subtitle ??
            "Nuestros servicios como courier en República Dominicana incluyen"
          }
        />
        <BlocksSlot
          renderBlocks={renderBlocks}
          className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3"
        />
      </div>
    </section>
  );
};

export const serviciosSettingsSchema = [
  {
    id: "heading",
    label: "Título",
    type: "text",
    default: "Nuestros Servicios",
  },
  {
    id: "subtitle",
    label: "Subtítulo",
    type: "text",
    default:
      "Nuestros servicios como courier en República Dominicana incluyen",
  },
];
