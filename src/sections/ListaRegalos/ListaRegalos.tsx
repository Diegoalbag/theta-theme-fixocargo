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
  benefit1Value?: string;
  benefit1Label?: string;
  benefit2Title?: string;
  benefit2Body?: string;
  renderBlocks?: () => React.ReactNode;
  sectionId?: string;
  sectionName?: string;
}

export const ListaRegalos = ({
  eyebrow = "Celebra con Fixo",
  heading = "Lista de Regalos",
  promoHeading = "¿Planeando tu baby shower, cumpleaños o boda?",
  promoBody = "Haz que tu celebración sea aún más especial. Crea tu lista de regalos y disfruta de beneficios exclusivos con Fixo Cargo.",
  // The two promo tiles (quick task 260827) were literal text until the 2026-08
  // copy revision rewrote tile 2 and flagged that its wording depends on an
  // unsettled commercial condition. They are settings now so a copy change --
  // or the eventual Amazon Gift Card condition -- never needs a code change.
  // Tile 1 keeps its value/label split because the value renders as the large
  // display numeral; passing an empty string to either hides that half.
  benefit1Value = "20%",
  benefit1Label = "de descuento en el flete",
  benefit2Title = "Amazon Gift Cards",
  benefit2Body = "Beneficios especiales para celebrar contigo.",
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
              {benefit1Value && (
                <span className="font-aku italic text-4xl leading-none">
                  {benefit1Value}
                </span>
              )}
              {benefit1Label && (
                <span className="font-gotham font-bold text-sm leading-tight">
                  {benefit1Label}
                </span>
              )}
            </div>
            <div className="flex flex-col items-center justify-center gap-1 rounded-2xl px-6 py-6 text-center text-white ring-2 ring-brand-yellow/50">
              {benefit2Title && (
                <span className="font-gotham font-bold text-base leading-tight">
                  {benefit2Title}
                </span>
              )}
              {benefit2Body && (
                <span className="font-gill text-sm text-white/70">
                  {benefit2Body}
                </span>
              )}
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

// Eight editable fields, ids → camelCase props.
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
      "Haz que tu celebración sea aún más especial. Crea tu lista de regalos y disfruta de beneficios exclusivos con Fixo Cargo.",
  },
  {
    id: "benefit1Value",
    label: "Beneficio 1 · Cifra",
    type: "text",
    default: "20%",
  },
  {
    id: "benefit1Label",
    label: "Beneficio 1 · Texto",
    type: "text",
    default: "de descuento en el flete",
  },
  {
    id: "benefit2Title",
    label: "Beneficio 2 · Título",
    type: "text",
    default: "Amazon Gift Cards",
  },
  {
    id: "benefit2Body",
    label: "Beneficio 2 · Texto",
    type: "text",
    default: "Beneficios especiales para celebrar contigo.",
  },
];
