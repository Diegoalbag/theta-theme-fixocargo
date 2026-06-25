import * as React from "react";

import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { BlocksSlot } from "@/lib/blocks-slot";

// Beneficios (SVC-02) — the navy dark benefits band. A dark SectionHeading
// (white H2 + yellow eyebrow) with a real yellow-pill section CTA anchor, over a
// responsive 1→3-up grid wrapping a SINGLE BlocksSlot of section-local
// `benefit-card` blocks. The default BlocksSlot EmptyState is KEPT (do NOT pass
// empty={null}) so a zero-card section shows the drop affordance (D-07). Layout
// lives on the wrapper className only, never on the slot (Pitfall 4).
//
// No state, no event handlers, no hex literals, @/ imports only.
export interface BeneficiosProps {
  heading?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  renderBlocks?: () => React.ReactNode;
  sectionId?: string;
  sectionName?: string;
}

export const Beneficios = ({
  heading = "Beneficios",
  subtitle,
  ctaLabel = "Explora Nuestros Beneficios",
  ctaUrl = "#",
  renderBlocks,
}: BeneficiosProps): React.ReactNode => {
  return (
    <section className="bg-brand-navy section-padding-y">
      <div className="container mx-auto container-padding-x">
        <SectionHeading
          variant="dark"
          title={heading}
          eyebrow={subtitle}
          cta={
            <Button variant="pill" asChild>
              <a href={ctaUrl || "#"}>{ctaLabel}</a>
            </Button>
          }
        />

        <BlocksSlot
          renderBlocks={renderBlocks}
          className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        />
      </div>
    </section>
  );
};

// Exactly 4 editable fields, ids → camelCase props.
export const beneficiosSettingsSchema = [
  {
    id: "heading",
    label: "Encabezado",
    type: "text",
    default: "Beneficios",
  },
  {
    id: "subtitle",
    label: "Subtítulo",
    type: "text",
    default: "",
  },
  {
    id: "ctaLabel",
    label: "Texto del botón",
    type: "text",
    default: "Explora Nuestros Beneficios",
  },
  {
    id: "ctaUrl",
    label: "Enlace del botón",
    type: "url",
    default: "#",
    placeholder: "https://…",
  },
];
