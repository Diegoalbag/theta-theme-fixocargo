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
// Optional full-section background image (full-bleed url-guard, NOT ImageGuard —
// Pitfall 3): when set it paints object-cover behind a fixed navy tint that keeps
// the white heading + pills legible; with no image the base bg-brand-navy shows,
// so the band is never a broken <img>.
//
// No state, no event handlers, no hex literals, @/ imports only.
interface BackgroundImage {
  id: string;
  url?: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface EnviosNacionalesProps {
  kicker?: string;
  heading?: string;
  body?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  backgroundImage?: BackgroundImage;
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
  backgroundImage,
  renderBlocks,
}: EnviosNacionalesProps): React.ReactNode => {
  return (
    <section className="relative overflow-hidden bg-brand-navy section-padding-y">
      {/* Full-bleed background image + navy tint (url-guard, NOT ImageGuard —
          Pitfall 3). Both absolutely positioned; the content container below is
          `relative` so it stacks above them. The base bg-brand-navy is the
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
      <div className="relative container flex flex-col lg:flex-row gap-12 lg:gap-24 justify-between mx-auto container-padding-x">
        <div className="flex flex-col justify-center max-w-[500px]">
          <SectionHeading
            className="flex flex-col gap-2"
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
            <p className="mt-4 text-xl leading-5 font-opensans text-white/80 max-w-2xl">
              {body}
            </p>
          )}
        </div>

        <BlocksSlot
          renderBlocks={renderBlocks}
          className="mt-8 flex flex-col gap-4 w-full"
        />
      </div>
    </section>
  );
};

// Six editable fields, ids → camelCase props.
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
  {
    id: "backgroundImage",
    label: "Imagen de fondo",
    type: "image_picker",
    default: undefined,
  },
];
