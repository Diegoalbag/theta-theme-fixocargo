import * as React from "react";

import { ImageGuard } from "@/lib/image-guard";
import { BlocksSlot } from "@/lib/blocks-slot";

// DescargaApp (SVC-03) — the app-download band. A full-bleed background image
// (full-bleed url-guard per RESEARCH Pattern 2 / HeroSlide — NOT ImageGuard,
// which boxes at 16:9, Pitfall 3) behind a FIXED ~60% yellow overlay (D-05 —
// CSS-only, never a customizer control). The content layer is a two-column row
// (stacked on mobile): LEFT = heading / body / a SINGLE BlocksSlot row of the
// SHARED `store-badge` child blocks (default EmptyState kept, D-07); RIGHT = two
// guarded phone mockups via ImageGuard (the contained-image case, Pitfall 3).
//
// Stateless: no useState, no hooks, no event handlers. All content arrives as
// props. Decorative layers are aria-hidden. Brand tokens only — no hex literals
// (FND-03). @/ imports only. The store-badge block is REUSED via the registry
// allow-list, never recreated here.
export interface DescargaAppProps {
  backgroundImage?: {
    id: string;
    url?: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  phoneImage1?: {
    id: string;
    url?: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  phoneImage2?: {
    id: string;
    url?: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  heading?: string;
  body?: string;
  renderBlocks?: () => React.ReactNode;
  sectionId?: string;
  sectionName?: string;
}

export const DescargaApp = ({
  backgroundImage,
  phoneImage1,
  phoneImage2,
  heading = "Descarga ya la Fixo App",
  body = "La forma más rápida y fácil de rastrear tus envíos en tiempo real.",
  renderBlocks,
}: DescargaAppProps): React.ReactNode => {
  return (
    <section className="relative overflow-hidden">
      {/* Full-bleed background — url-guard (RESEARCH Pattern 2 / HeroSlide):
          paint object-cover when set, else a navy placeholder (no broken img,
          QA-01). NOT ImageGuard — that boxes at 16:9 (Pitfall 3). */}
      {backgroundImage?.url ? (
        <img
          src={backgroundImage.url}
          alt={backgroundImage.alt ?? ""}
          width={backgroundImage.width}
          height={backgroundImage.height}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div aria-hidden className="absolute inset-0 bg-brand-navy" />
      )}

      {/* Fixed ~60% yellow overlay (D-05 — CSS-only, not a customizer control). */}
      <div aria-hidden className="absolute inset-0 bg-brand-yellow/60" />

      {/* Content layer — two-column on desktop, stacked on mobile. */}
      <div className="container relative mx-auto container-padding-x">
        <div className="flex flex-col items-center justify-between gap-8 lg:flex-row">
          {/* LEFT — heading / body / store-badge row. */}
          <div className="flex flex-col items-center lg:items-start gap-4 lg:gap-6 lg:flex-1 max-w-96">
            <h2 className="font-aku text-center md:text-left text-brand-navy text-6xl lg:text-7xl leading-16 lg:leading-20">
              {heading}
            </h2>

            {body && (
              <p className="font-opensans text-center md:text-left text-brand-navy text-xl max-w-xl">
                {body}
              </p>
            )}

            {/* SINGLE shared store-badge slot — default EmptyState kept (D-07).
                Layout lives on this wrapper className, never on the slot. */}
            <BlocksSlot
              renderBlocks={renderBlocks}
              className="flex flex-col lg:flex-row items-center gap-2 lg:gap-4"
            />
          </div>

          {/* RIGHT — two guarded phone mockups (ImageGuard, the contained case). */}
          <div className="flex justify-end items-end gap-4 lg:flex-1">
            <div className="w-40 md:w-56 lg:w-64">
              <ImageGuard
                className="transform translate-x-10 lg:translate-x-0 lg:translate-y-10 z-50"
                url={phoneImage1?.url}
                alt={phoneImage1?.alt ?? ""}
                ratio={9 / 16}
                width={phoneImage1?.width}
                height={phoneImage1?.height}
              />
            </div>
            <div className="w-40 md:w-56 lg:w-64">
              <ImageGuard
                className="transform -translate-x-10 lg:-translate-x-30 -translate-y-10 z-50"
                url={phoneImage2?.url}
                alt={phoneImage2?.alt ?? ""}
                ratio={9 / 16}
                width={phoneImage2?.width}
                height={phoneImage2?.height}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Exactly 5 editable fields, ids → camelCase props. image_picker defaults
// `undefined` (matches SiteHeader / HeroSlide) so unset images hit the guards.
export const descargaAppSettingsSchema = [
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
    default: "Descarga ya la Fixo App",
  },
  {
    id: "body",
    label: "Texto",
    type: "textarea",
    default:
      "La forma más rápida y fácil de rastrear tus envíos en tiempo real.",
  },
  {
    id: "phoneImage1",
    label: "Mockup de teléfono 1",
    type: "image_picker",
    default: undefined,
  },
  {
    id: "phoneImage2",
    label: "Mockup de teléfono 2",
    type: "image_picker",
    default: undefined,
  },
];
