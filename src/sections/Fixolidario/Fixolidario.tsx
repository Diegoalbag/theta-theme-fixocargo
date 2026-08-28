import * as React from "react";

import { BlocksSlot } from "@/lib/blocks-slot";
import { safeAnchorId } from "@/lib/safe-anchor";
import { cn } from "@/lib/utils";

// Fixolidario (quick task 260708-dm3) — the FixoCargo homepage donation-
// program band. Off-white band (bg-muted, this theme's existing off-white
// token — see NosotrosTimeline for precedent). Mirrors ServiciosList's
// left-aligned inline eyebrow+heading header shape (yellow kicker, navy
// display-italic heading, plain <p>/<h2>, NOT SectionHeading) plus a body
// paragraph, a bespoke dark highlight banner (statValue/statHeadline/
// statBody), a partners sub-heading, and a single BlocksSlot grid of the
// section-local `partner-card` block. The default BlocksSlot EmptyState is
// KEPT (do NOT pass empty={null}) so a zero-partner section shows
// "Sin elementos" instead of a blank gap. Layout lives on the wrapper
// className only, never on the slot.
//
// DEEP LINKS (quick task 260828): an optional merchant-typed `anchorId` renders
// as the `id` on this <section>, so a nav link or CTA can target the whole band.
// Same guard (safeAnchorId) and same contract as the faq and sucursales
// sections: a blank value normalizes to `undefined`, which React drops
// entirely, so a section saved before this field existed renders
// byte-identically, class string included.
//
// No state, no event handlers, no hex literals, @/ imports only.
export interface FixolidarioProps {
  kicker?: string;
  heading?: string;
  body?: string;
  statValue?: string;
  statHeadline?: string;
  statBody?: string;
  partnersHeading?: string;
  anchorId?: string;
  renderBlocks?: () => React.ReactNode;
  sectionId?: string;
  sectionName?: string;
}

export const Fixolidario = ({
  kicker = "Responsabilidad social",
  heading = "Fixolidario",
  body = "Refleja nuestro compromiso con la sociedad. En alianza con diversas fundaciones, canalizamos el espíritu solidario de nuestros clientes, dándoles la oportunidad de contribuir a causas importantes mientras disfrutan de nuestros servicios de envío.",
  statValue = "5%",
  statHeadline = "del costo de envío se dona a la fundación que elijas",
  statBody = "Por cada pedido realizado a través de los enlaces de fundaciones asociadas, contribuyendo directamente a sus proyectos y causas solidarias.",
  partnersHeading = "Conoce a nuestros asociados",
  anchorId = "",
  renderBlocks,
}: FixolidarioProps): React.ReactNode => {
  const anchor = safeAnchorId(anchorId);

  return (
    <section
      id={anchor}
      className={cn(
        "section-padding-y",
        // Cushion applied ONLY when anchored, so an un-anchored band's class
        // string is unchanged.
        anchor && "scroll-mt-24",
      )}
    >
      <div className="container mx-auto container-padding-x">
        <div className="flex flex-col items-start gap-3 max-w-3xl">
          {kicker && (
            <p className="font-gotham text-brand-yellow text-sm uppercase tracking-wide">
              {kicker}
            </p>
          )}
          {heading && (
            <h2 className="font-aku italic text-brand-navy text-3xl lg:text-5xl">
              {heading}
            </h2>
          )}
          {body && (
            <p className="pt-1 font-gill text-base text-muted-foreground lg:text-lg">
              {body}
            </p>
          )}
        </div>

        {(statValue || statHeadline || statBody) && (
          <div className="mt-8 flex flex-col items-start gap-6 rounded-2xl bg-brand-navy p-8 sm:flex-row sm:items-center sm:gap-9 lg:p-11">
            {statValue && (
              <span className="shrink-0 font-aku italic text-6xl leading-none text-brand-yellow lg:text-8xl">
                {statValue}
              </span>
            )}
            <div className="flex flex-col gap-1.5">
              {statHeadline && (
                <p className="font-gotham text-lg font-bold text-white lg:text-xl">
                  {statHeadline}
                </p>
              )}
              {statBody && (
                <p className="font-gill text-sm text-white/70 lg:text-base">
                  {statBody}
                </p>
              )}
            </div>
          </div>
        )}

        {partnersHeading && (
          <p className="mt-12 font-gotham text-lg font-bold text-brand-navy lg:text-xl">
            {partnersHeading}
          </p>
        )}

        <BlocksSlot
          renderBlocks={renderBlocks}
          className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        />
      </div>
    </section>
  );
};

// Exactly 7 editable fields, ids → camelCase props.
export const fixolidarioSettingsSchema = [
  {
    id: "kicker",
    label: "Etiqueta superior",
    type: "text",
    default: "Responsabilidad social",
  },
  {
    id: "heading",
    label: "Título",
    type: "text",
    default: "Fixolidario",
  },
  {
    id: "body",
    label: "Descripción",
    type: "textarea",
    default:
      "Refleja nuestro compromiso con la sociedad. En alianza con diversas fundaciones, canalizamos el espíritu solidario de nuestros clientes, dándoles la oportunidad de contribuir a causas importantes mientras disfrutan de nuestros servicios de envío.",
  },
  {
    id: "statValue",
    label: "Valor destacado",
    type: "text",
    default: "5%",
  },
  {
    id: "statHeadline",
    label: "Título del destacado",
    type: "text",
    default: "del costo de envío se dona a la fundación que elijas",
  },
  {
    id: "statBody",
    label: "Descripción del destacado",
    type: "textarea",
    default:
      "Por cada pedido realizado a través de los enlaces de fundaciones asociadas, contribuyendo directamente a sus proyectos y causas solidarias.",
  },
  {
    id: "partnersHeading",
    label: "Título de asociados",
    type: "text",
    default: "Conoce a nuestros asociados",
  },
  {
    id: "anchorId",
    label: "Ancla (enlace directo)",
    type: "text",
    default: "",
    info: "Escribe una palabra corta, por ejemplo fixolidario. El enlace directo a esta sección será la dirección de tu página seguida de una almohadilla y esa palabra. Déjalo vacío si no lo necesitas.",
  },
];
