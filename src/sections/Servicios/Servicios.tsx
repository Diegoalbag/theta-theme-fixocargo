import * as React from "react";

import { SectionHeading } from "@/components/ui/section-heading";
import { PromoBanner } from "@/blocks/PromoBanner";
import { BlocksSlot } from "@/lib/blocks-slot";

// Servicios (SVC-01) — the off-white services band, a 50/50 two-zone layout:
// LEFT a single BlocksSlot of section-local service-item blocks (add/remove/
// reorder), RIGHT a settings-driven rail of up to two promo banners.
//
// Why the banners are section settings and NOT blocks: the platform exposes
// exactly ONE block slot per section, and a single mixed slot cannot be split by
// blockType without diverging between the customizer (one opaque Puck slot) and
// the published site (D-02/D-03) — which would break the customizer-fidelity
// core value. So the right rail is driven by Servicios settings here. When
// multi-slot sections land, the banners can move back to a real second slot.
//
// PromoBanner is imported as a shared presentational component (it is no longer
// a registered block) — an acyclic import (PromoBanner -> Button only).
//
// The two zones are grid items carrying `order-*`: to put the banners FIRST on
// mobile, swap the services wrapper to `order-2 lg:order-1` and the banner rail
// to `order-1 lg:order-2`. Layout NEVER on the slot itself (Pitfall 4) — the
// BlocksSlot owns its own flex-col wrapper. The default BlocksSlot EmptyState is
// KEPT (do NOT pass empty={null}, D-07) so a zero-service slot shows "Sin
// elementos" instead of a blank gap.
//
// No state, no event handlers, no hex literals, @/ imports only.
interface BannerImage {
  id: string;
  url?: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface ServiciosProps {
  heading?: string;
  subtitle?: string;
  // Banner 1 — top of the right rail (always shown).
  bannerImage?: BannerImage;
  bannerKicker?: string;
  bannerHeadline?: string;
  bannerCtaLabel?: string;
  bannerCtaUrl?: string;
  // Banner 2 — optional, below banner 1.
  showSecondBanner?: boolean;
  banner2Image?: BannerImage;
  banner2Kicker?: string;
  banner2Headline?: string;
  banner2CtaLabel?: string;
  banner2CtaUrl?: string;
  renderBlocks?: () => React.ReactNode;
  sectionId?: string;
  sectionName?: string;
}

export const Servicios = ({
  heading,
  subtitle,
  bannerImage,
  bannerKicker,
  bannerHeadline,
  bannerCtaLabel,
  bannerCtaUrl,
  showSecondBanner,
  banner2Image,
  banner2Kicker,
  banner2Headline,
  banner2CtaLabel,
  banner2CtaUrl,
  renderBlocks,
}: ServiciosProps): React.ReactNode => {
  return (
    <section className="bg-background section-padding-y">
      <div className="container mx-auto container-padding-x">
        <SectionHeading
          title={heading ?? "Nuestros Servicios"}
          subtitle={
            subtitle ??
            "Nuestros servicios como courier en República Dominicana incluyen"
          }
        />
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* LEFT zone — services slot. order-1 keeps services first; for a
              banners-first mobile stack, change this to `order-2 lg:order-1`. */}
          <div className="order-1">
            <BlocksSlot
              renderBlocks={renderBlocks}
              className="flex flex-col gap-5"
            />
          </div>
          {/* RIGHT zone — settings-driven banner rail (pairs with the swap
              above as `order-1 lg:order-2` for banners-first on mobile). */}
          <div className="order-2 flex flex-col gap-5">
            <PromoBanner
              backgroundImage={bannerImage}
              kicker={bannerKicker}
              headline={bannerHeadline}
              ctaLabel={bannerCtaLabel}
              ctaUrl={bannerCtaUrl}
            />
            {/* `!== false` (not a truthy check) so the default-on second banner
                still shows on sections saved BEFORE this setting existed, where
                showSecondBanner arrives `undefined`. Explicit FX Logistics
                fallbacks keep banner 2 distinct from banner 1's franquicias
                default when a legacy section has no banner-2 values yet. */}
            {showSecondBanner !== false && (
              <PromoBanner
                backgroundImage={banner2Image}
                kicker={banner2Kicker ?? "FX Logistics"}
                headline={
                  banner2Headline ??
                  "¿Estás considerando reservar un espacio de almacenamiento?"
                }
                ctaLabel={banner2CtaLabel}
                ctaUrl={banner2CtaUrl}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export const serviciosSettingsSchema = [
  {
    id: "heading",
    label: "Título",
    type: "text",
    default: "Nuestros Servicios",
  },
  {
    id: "subtitle",
    label: "Subtítulo",
    type: "text",
    default:
      "Nuestros servicios como courier en República Dominicana incluyen",
  },
  // Banner 1 (right-rail top).
  {
    id: "bannerImage",
    label: "Banner 1 · Imagen de fondo",
    type: "image_picker",
    default: undefined,
  },
  {
    id: "bannerKicker",
    label: "Banner 1 · Etiqueta",
    type: "text",
    default: "Se parte de Fixocargo",
  },
  {
    id: "bannerHeadline",
    label: "Banner 1 · Titular",
    type: "textarea",
    default: "Si te interesa ser parte de nuestra red de franquicias",
  },
  {
    id: "bannerCtaLabel",
    label: "Banner 1 · Texto del botón",
    type: "text",
    default: "Haz clic aquí",
  },
  {
    id: "bannerCtaUrl",
    label: "Banner 1 · Enlace del botón",
    type: "url",
    default: "#",
  },
  // Banner 2 (optional).
  {
    id: "showSecondBanner",
    label: "Mostrar segundo banner",
    type: "checkbox",
    default: true,
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
