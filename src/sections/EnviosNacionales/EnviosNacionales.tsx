import * as React from "react";

import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { BlocksSlot } from "@/lib/blocks-slot";

// EnviosNacionales (INF-02) — the navy dark "national shipping" band. Mirrors the
// Beneficios precedent (D-06): a dark SectionHeading (white H2 + yellow eyebrow)
// with a real yellow-pill section CTA anchor, an optional body paragraph sibling
// after the heading, over a SINGLE stacking BlocksSlot of section-local
// `faq-pill` blocks. The kicker maps to the SectionHeading eyebrow. The default
// BlocksSlot EmptyState is KEPT (do NOT pass empty={null}) so a zero-pill section
// shows the drop affordance (D-08). Layout lives on the slot className only.
//
// No state, no event handlers, no hex literals, @/ imports only.
export interface EnviosNacionalesProps {
  kicker?: string;
  heading?: string;
  body?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  renderBlocks?: () => React.ReactNode;
  sectionId?: string;
  sectionName?: string;
}

export const EnviosNacionales = ({
  kicker = "#FixoTeGuía",
  heading = "Envíos Nacionales",
  body = "Con nuestro servicio de envíos nacionales, puedes mandar paquetes entre nuestras sucursales.",
  ctaLabel = "Conoce más",
  ctaUrl = "#",
  renderBlocks,
}: EnviosNacionalesProps): React.ReactNode => {
  return (
    <section className="bg-brand-navy section-padding-y">
      <div className="container mx-auto container-padding-x">
        <SectionHeading
          variant="dark"
          title={heading}
          eyebrow={kicker}
          cta={
            <Button variant="pill" asChild>
              <a href={ctaUrl || "#"}>{ctaLabel}</a>
            </Button>
          }
        />

        {body && (
          <p className="mt-4 font-opensans text-white/80 max-w-2xl">{body}</p>
        )}

        <BlocksSlot
          renderBlocks={renderBlocks}
          className="mt-8 flex flex-col gap-4"
        />
      </div>
    </section>
  );
};

// Exactly 5 editable fields, ids → camelCase props.
export const enviosNacionalesSettingsSchema = [
  {
    id: "kicker",
    label: "Etiqueta",
    type: "text",
    default: "#FixoTeGuía",
  },
  {
    id: "heading",
    label: "Encabezado",
    type: "text",
    default: "Envíos Nacionales",
  },
  {
    id: "body",
    label: "Descripción",
    type: "textarea",
    default:
      "Con nuestro servicio de envíos nacionales, puedes mandar paquetes entre nuestras sucursales.",
  },
  {
    id: "ctaLabel",
    label: "Texto del botón",
    type: "text",
    default: "Conoce más",
  },
  {
    id: "ctaUrl",
    label: "Enlace del botón",
    type: "url",
    default: "#",
    placeholder: "https://…",
  },
];
