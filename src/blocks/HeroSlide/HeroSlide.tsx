import * as React from "react";

import { Button } from "@/components/ui/button";

// HeroSlide — section-local block for the Hero (ATF-01) Blaze Slider carousel.
// Blaze sizes each slide to the full track width via `.blaze-track > *`, so the
// article only needs height + layout here (no w-full/shrink-0/snap-start).
// Each slide paints its OWN background image
// (full-bleed url-guard per RESEARCH Pattern 2 — NOT ImageGuard, which boxes at
// 16:9, Pitfall 3) behind a fixed ~50% dark overlay, then renders a left-aligned,
// vertically-centered column of heading / optional subtitle / optional CTA.
//
// Stateless: no useState, no hooks, no event handlers. All content arrives as
// props from the platform. Decorative elements are aria-hidden. Brand tokens
// only — no hex literals (FND-03). @/ imports only.
export interface HeroSlideProps {
  backgroundImage?: {
    id: string;
    url?: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  heading?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  blockId?: string;
  blockType?: string;
}

export const HeroSlide = ({
  backgroundImage,
  heading,
  subtitle,
  ctaLabel,
  ctaUrl,
}: HeroSlideProps): React.ReactNode => {
  return (
    <article className="relative flex items-center overflow-hidden min-h-[60vh] md:min-h-[560px]">
      {/* Full-bleed per-slide background — url-guard (RESEARCH Pattern 2, D-04).
          When the image is set, paint it object-cover; otherwise a navy
          placeholder (no broken img, QA-01). */}
      {backgroundImage?.url ? (
        <img
          src={backgroundImage.url}
          alt={backgroundImage.alt ?? ""}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div aria-hidden className="absolute inset-0 bg-brand-navy" />
      )}

      {/* Fixed ~50% dark overlay (matches design rgba(0,0,0,0.5); POL-02
          overlayOpacity is v2 — overlay stays fixed here). */}
      <div aria-hidden className="absolute inset-0 bg-black/50" />

      {/* Content layer — left-aligned column, vertically centered via the
          article's items-center. */}
      <div className="container relative mx-auto container-padding-x">
        <div className="flex max-w-2xl flex-col items-start gap-6">
          <h2 className="font-display italic text-white text-4xl md:text-6xl lg:text-7xl leading-tight">
            {heading ??
              "Transportamos lo que necesitas del mundo a tus manos"}
          </h2>

          {subtitle && (
            <p className="font-gill text-white text-lg md:text-2xl">
              {subtitle}
            </p>
          )}

          {ctaLabel && (
            <Button variant="pill" asChild>
              <a href={ctaUrl || "#"}>{ctaLabel}</a>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
};

export const heroSlideSettingsSchema = [
  {
    id: "backgroundImage",
    label: "Imagen de fondo",
    type: "image_picker",
    default: undefined,
  },
  {
    id: "heading",
    label: "Título",
    type: "text",
    default: "Transportamos lo que necesitas del mundo a tus manos",
  },
  {
    id: "subtitle",
    label: "Subtítulo",
    type: "text",
    default: "Fixo Cargo Courier",
  },
  {
    id: "ctaLabel",
    label: "Texto del botón",
    type: "text",
    default: "Buscar",
  },
  {
    id: "ctaUrl",
    label: "Enlace del botón",
    type: "url",
    default: "#",
  },
];
