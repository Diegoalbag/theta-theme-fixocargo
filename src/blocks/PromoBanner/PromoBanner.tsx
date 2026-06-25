import * as React from "react";

import { Button } from "@/components/ui/button";

// PromoBanner (SVC-01) — section-local block for the Servicios band's right
// rail. A full-bleed promotional card: it paints its OWN background image
// behind a FIXED navy bottom-gradient (CSS-only, D-05 precedent — NOT a
// customizer control), then stacks an optional kicker, a headline, and a real
// brand-yellow pill CTA anchor. The background uses the HeroSlide full-bleed
// url-guard (NOT ImageGuard, which boxes 16:9 — Pitfall 3): when the image is
// set, paint it object-cover; otherwise a navy placeholder (no broken img).
//
// No state, no event handlers, no hex literals, @/ imports only.
export interface PromoBannerProps {
  backgroundImage?: {
    id: string;
    url?: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  kicker?: string;
  headline?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  blockId?: string;
  blockType?: string;
}

export const PromoBanner = ({
  backgroundImage,
  kicker = "Se parte de Fixocargo",
  headline = "Si te interesa ser parte de nuestra red de franquicias",
  ctaLabel = "Haz clic aquí",
  ctaUrl = "#",
}: PromoBannerProps): React.ReactNode => {
  return (
    <div className="relative overflow-hidden rounded-2xl min-h-[220px] flex">
      {/* Full-bleed background — url-guard (Pitfall 3, NOT ImageGuard). */}
      {backgroundImage?.url ? (
        <img
          src={backgroundImage.url}
          alt={backgroundImage.alt ?? ""}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div aria-hidden className="absolute inset-0 bg-brand-navy" />
      )}

      {/* Fixed navy bottom-gradient overlay (CSS-only, D-05). */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-brand-navy"
      />

      {/* Content layer. */}
      <div className="relative mt-auto flex flex-col items-start gap-3 p-6">
        {kicker && (
          <span className="font-gotham text-sm font-bold uppercase tracking-wide text-brand-yellow">
            {kicker}
          </span>
        )}
        <p className="font-gotham font-bold text-white text-xl leading-snug">
          {headline}
        </p>
        <Button variant="pill" asChild>
          <a href={ctaUrl || "#"}>{ctaLabel}</a>
        </Button>
      </div>
    </div>
  );
};

export const promoBannerSettingsSchema = [
  {
    id: "backgroundImage",
    label: "Imagen de fondo",
    type: "image_picker",
    default: undefined,
  },
  {
    id: "kicker",
    label: "Etiqueta",
    type: "text",
    default: "Se parte de Fixocargo",
  },
  {
    id: "headline",
    label: "Titular",
    type: "textarea",
    default: "Si te interesa ser parte de nuestra red de franquicias",
  },
  {
    id: "ctaLabel",
    label: "Texto del botón",
    type: "text",
    default: "Haz clic aquí",
  },
  {
    id: "ctaUrl",
    label: "Enlace del botón",
    type: "url",
    default: "#",
  },
];
