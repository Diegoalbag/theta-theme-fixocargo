import * as React from "react";

import { Card } from "@/components/ui/card";
import { BlocksSlot } from "@/lib/blocks-slot";

// ListaRegalos (quick task 260706-qqi) — the FixoCargo "Lista de Regalos"
// page section. The same left-aligned inline eyebrow+heading header as
// BeneficiosGrid/AppFeatures/PlanReferimiento, over a promo banner Card
// (editable heading/body + TWO hardcoded highlight tiles — locked decision,
// the design shows exactly 2 fixed tiles), a hardcoded "¿Cómo funciona?"
// label + divider, and a responsive 1→3-up grid wrapping a SINGLE BlocksSlot
// of section-local `gift-step` blocks. The default BlocksSlot EmptyState is
// KEPT (do NOT pass empty={null}) so a zero-step section shows "Sin
// elementos" instead of a blank gap. Layout lives on the wrapper className
// only, never on the slot.
//
// No state, no event handlers, no hex literals, @/ imports only.
export interface ListaRegalosProps {
  eyebrow?: string;
  heading?: string;
  promoHeading?: string;
  promoBody?: string;
  renderBlocks?: () => React.ReactNode;
  sectionId?: string;
  sectionName?: string;
}

export const ListaRegalos = ({
  eyebrow = "Celebra con Fixo",
  heading = "Lista de Regalos",
  promoHeading = "¿Planeando tu baby shower, cumpleaños o boda?",
  promoBody = "Hazlo aún más especial. Crea tu lista de regalos con nosotros y disfruta de beneficios exclusivos.",
  renderBlocks,
}: ListaRegalosProps): React.ReactNode => {
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

        <Card
          variant="navy-dark"
          className="mt-8 flex flex-col gap-8 p-8 lg:flex-row lg:items-center lg:justify-between lg:p-11"
        >
          <div className="flex flex-col gap-3 lg:max-w-md">
            {promoHeading && (
              <p className="font-aku italic text-white text-2xl lg:text-3xl leading-tight">
                {promoHeading}
              </p>
            )}
            {promoBody && (
              <p className="font-gill text-white/70 text-lg leading-6">
                {promoBody}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-brand-yellow px-6 py-6 text-center text-brand-navy">
              <span className="font-aku italic text-4xl leading-none">
                20%
              </span>
              <span className="font-gotham font-bold text-sm leading-tight">
                de descuento en el flete
              </span>
            </div>
            <div className="flex flex-col items-center justify-center gap-1 rounded-2xl px-6 py-6 text-center text-white ring-2 ring-brand-yellow/50">
              <span className="font-gotham font-bold text-base leading-tight">
                Gana Amazon Gift Cards
              </span>
              <span className="font-gill text-sm text-white/70">
                perfectas para consentirte
              </span>
            </div>
          </div>
        </Card>

        <div className="mt-10 flex items-center gap-4">
          <span className="font-gotham text-brand-navy text-sm uppercase tracking-wide">
            ¿Cómo funciona?
          </span>
          <span aria-hidden className="h-px flex-1 bg-border" />
        </div>

        <BlocksSlot
          renderBlocks={renderBlocks}
          className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3"
        />
      </div>
    </section>
  );
};

// Exactly 4 editable fields, ids → camelCase props.
export const listaRegalosSettingsSchema = [
  {
    id: "eyebrow",
    label: "Etiqueta superior",
    type: "text",
    default: "Celebra con Fixo",
  },
  {
    id: "heading",
    label: "Título",
    type: "text",
    default: "Lista de Regalos",
  },
  {
    id: "promoHeading",
    label: "Título del banner",
    type: "textarea",
    default: "¿Planeando tu baby shower, cumpleaños o boda?",
  },
  {
    id: "promoBody",
    label: "Descripción del banner",
    type: "textarea",
    default:
      "Hazlo aún más especial. Crea tu lista de regalos con nosotros y disfruta de beneficios exclusivos.",
  },
];
