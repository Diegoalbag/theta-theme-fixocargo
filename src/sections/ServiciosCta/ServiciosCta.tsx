import * as React from "react";

import { PromoBanner } from "@/blocks/PromoBanner";

// ServiciosCta (quick task 260707-etz) — the FixoCargo "Servicios" page CTA
// band. NAMING NOTE: the directory/file/component/interface is `ServiciosCta`
// (capital C only), NOT `ServiciosCTA` — test/static-audit.test.tsx derives
// each section's source path from its registry key (`servicios-cta`) by
// capitalizing only the FIRST letter of each hyphen segment, so a full-caps
// `CTA` directory would break that test's file lookup.
//
// A fully self-contained section with NO renderBlocks prop and NO
// BlocksSlot — mirrors PlanReferimiento's no-block pattern — reusing
// PromoBanner (src/blocks/PromoBanner) as a plain presentational component
// (same acyclic import already used by src/sections/Servicios/Servicios.tsx).
// Unlike Servicios.tsx's optional second banner, BOTH banners here are
// ALWAYS rendered — the design shows a fixed pair of side-by-side cards, not
// an optional single banner.
//
// No state, no event handlers, no hex literals, @/ imports only.
interface BannerImage {
  id: string;
  url?: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface ServiciosCtaProps {
  eyebrow?: string;
  heading?: string;
  banner1Image?: BannerImage;
  banner1Kicker?: string;
  banner1Headline?: string;
  banner1CtaLabel?: string;
  banner1CtaUrl?: string;
  banner2Image?: BannerImage;
  banner2Kicker?: string;
  banner2Headline?: string;
  banner2CtaLabel?: string;
  banner2CtaUrl?: string;
  sectionId?: string;
  sectionName?: string;
}

export const ServiciosCta = ({
  eyebrow = "Crece con nosotros",
  heading = "Más que un courier",
  banner1Image,
  banner1Kicker = "Sé parte de Fixo Cargo",
  banner1Headline = "Si te interesa ser parte de nuestra red de franquicias",
  banner1CtaLabel = "Haz clic aquí",
  banner1CtaUrl = "#",
  banner2Image,
  banner2Kicker = "FX Logistics",
  banner2Headline = "¿Estás considerando reservar un espacio de almacenamiento?",
  banner2CtaLabel = "Haz clic aquí",
  banner2CtaUrl = "#",
}: ServiciosCtaProps): React.ReactNode => {
  return (
    <section className="bg-background section-padding-y">
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

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <PromoBanner
            backgroundImage={banner1Image}
            kicker={banner1Kicker}
            headline={banner1Headline}
            ctaLabel={banner1CtaLabel}
            ctaUrl={banner1CtaUrl}
          />
          <PromoBanner
            backgroundImage={banner2Image}
            kicker={banner2Kicker}
            headline={banner2Headline}
            ctaLabel={banner2CtaLabel}
            ctaUrl={banner2CtaUrl}
          />
        </div>
      </div>
    </section>
  );
};

// Exactly 12 editable fields, ids → camelCase props.
export const serviciosCtaSettingsSchema = [
  {
    id: "eyebrow",
    label: "Etiqueta superior",
    type: "text",
    default: "Crece con nosotros",
  },
  {
    id: "heading",
    label: "Título",
    type: "text",
    default: "Más que un courier",
  },
  {
    id: "banner1Image",
    label: "Banner 1 · Imagen de fondo",
    type: "image_picker",
    default: undefined,
  },
  {
    id: "banner1Kicker",
    label: "Banner 1 · Etiqueta",
    type: "text",
    default: "Sé parte de Fixo Cargo",
  },
  {
    id: "banner1Headline",
    label: "Banner 1 · Titular",
    type: "textarea",
    default: "Si te interesa ser parte de nuestra red de franquicias",
  },
  {
    id: "banner1CtaLabel",
    label: "Banner 1 · Texto del botón",
    type: "text",
    default: "Haz clic aquí",
  },
  {
    id: "banner1CtaUrl",
    label: "Banner 1 · Enlace del botón",
    type: "url",
    default: "#",
  },
  {
    id: "banner2Image",
    label: "Banner 2 · Imagen de fondo",
    type: "image_picker",
    default: undefined,
  },
  {
    id: "banner2Kicker",
    label: "Banner 2 · Etiqueta",
    type: "text",
    default: "FX Logistics",
  },
  {
    id: "banner2Headline",
    label: "Banner 2 · Titular",
    type: "textarea",
    default: "¿Estás considerando reservar un espacio de almacenamiento?",
  },
  {
    id: "banner2CtaLabel",
    label: "Banner 2 · Texto del botón",
    type: "text",
    default: "Haz clic aquí",
  },
  {
    id: "banner2CtaUrl",
    label: "Banner 2 · Enlace del botón",
    type: "url",
    default: "#",
  },
];
