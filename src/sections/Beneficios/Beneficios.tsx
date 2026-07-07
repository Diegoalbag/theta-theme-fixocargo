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
// Optional full-section background image (full-bleed url-guard, NOT ImageGuard —
// Pitfall 3): when set it paints object-cover behind a fixed navy tint that keeps
// the white heading and cards legible; with no image the base bg-brand-navy
// shows, so the band is never a broken <img>.
//
// No state, no event handlers, no hex literals, @/ imports only.
interface BackgroundImage {
  id: string;
  url?: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface BeneficiosProps {
  heading?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  backgroundImage?: BackgroundImage;
  renderBlocks?: () => React.ReactNode;
  sectionId?: string;
  sectionName?: string;
}

export const Beneficios = ({
  heading = "Beneficios",
  subtitle,
  ctaLabel = "Explora Nuestros Beneficios",
  ctaUrl = "#",
  backgroundImage,
  renderBlocks,
}: BeneficiosProps): React.ReactNode => {
  return (
    <section className="relative overflow-hidden bg-brand-navy section-padding-y">
      {/* Full-bleed background image + navy tint (url-guard, NOT ImageGuard —
          Pitfall 3). Both are absolutely positioned; the content wrapper below
          is `relative` so it stacks above them. The base bg-brand-navy is the
          fallback when no image is set. */}
      {backgroundImage?.url && (
        <img
          src={backgroundImage.url}
          alt={backgroundImage.alt ?? ""}
          width={backgroundImage.width}
          height={backgroundImage.height}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {backgroundImage?.url && (
        <div aria-hidden className="absolute inset-0 bg-brand-navy/70" />
      )}
      <div className="relative container mx-auto container-padding-x">
        <SectionHeading
          className="flex flex-col md:flex-row gap-4 justify-between"
          variant="dark"
          title={heading}
          subtitle={subtitle}
          cta={
            <Button size="lg" variant="pill" asChild>
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

// Five editable fields, ids → camelCase props.
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
  {
    id: "backgroundImage",
    label: "Imagen de fondo",
    type: "image_picker",
    default: undefined,
  },
];
