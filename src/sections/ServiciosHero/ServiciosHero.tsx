import * as React from "react";
import { Plane, Ship, Truck, ClipboardCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

// ServiciosHero (quick task 260707-etz) — the FixoCargo "Servicios" page dark
// hero band. A fully self-contained section with NO renderBlocks prop and NO
// BlocksSlot — matches the no-block pattern in
// src/sections/PlanReferimiento/PlanReferimiento.tsx.
//
// LEFT column: editable kicker/headline/body + two real anchor CTAs. RIGHT
// column: 4 FIXED icon tiles (Carga Aérea, Carga Marítima, Delivery, Aduanas)
// — a locked decision, never props-driven and never a block slot. Passing
// arbitrary/unrelated props never changes or removes them.
//
// OPTIONAL full-bleed background (quick task 260707-kpz, mirrors the
// NosotrosHero pattern): when `backgroundImage.url` is set, a full-bleed
// object-cover <img> plus a bg-black/50 overlay paint BEHIND the existing
// content (which stacks above via a `relative` container). Unlike
// NosotrosHero, ServiciosHero's text/tile colors NEVER flip — this section is
// already dark (bg-brand-navy, white/yellow text) by default, so every
// existing class stays exactly as-is in both modes. When unset, the section
// renders byte-identical to its original solid bg-brand-navy design.
//
// No state, no event handlers, no hex literals, @/ imports only.
export interface ServiciosHeroProps {
  backgroundImage?: {
    id: string;
    url?: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  kicker?: string;
  headline?: string;
  body?: string;
  primaryCtaLabel?: string;
  primaryCtaUrl?: string;
  secondaryCtaLabel?: string;
  secondaryCtaUrl?: string;
  sectionId?: string;
  sectionName?: string;
}

// Module-scoped, NOT exported — a single fixed icon tile for the right
// column. `tone` selects the solid (yellow-on-navy) vs outline (white-on-navy
// with a subtle ring) treatment per the design.
const HeroServiceTile = ({
  icon: Icon,
  label,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  tone: "solid" | "outline";
}): React.ReactNode => {
  return (
    <div
      className={
        tone === "solid"
          ? "flex aspect-square w-full flex-col items-center justify-center gap-2.5 rounded-2xl text-center bg-brand-yellow text-brand-navy"
          : "flex aspect-square w-full flex-col items-center justify-center gap-2.5 rounded-2xl text-center bg-white/5 text-white ring-1 ring-white/10"
      }
    >
      <Icon
        aria-hidden="true"
        className={tone === "solid" ? "size-9" : "size-9 text-brand-yellow"}
      />
      <span className="font-gotham text-sm font-bold">{label}</span>
    </div>
  );
};

export const ServiciosHero = ({
  backgroundImage,
  kicker = "Courier en República Dominicana",
  headline = "Nuestros Servicios",
  body = "Del pick up en Estados Unidos a la entrega en tu puerta: carga aérea y marítima, gestión aduanal, exportación e importación desde Europa. Todo lo que necesitas para mover tu mercancía, en un solo lugar.",
  primaryCtaLabel = "Explora los servicios",
  primaryCtaUrl = "#",
  secondaryCtaLabel = "Cotiza tu envío",
  secondaryCtaUrl = "#",
}: ServiciosHeroProps): React.ReactNode => {
  // Full-bleed background mode (image-conditional). Truthy url → image +
  // overlay behind content; falsy → the original solid bg-brand-navy design.
  // NOTE: unlike NosotrosHero, no text/tile color class ever changes here —
  // ServiciosHero is already dark by default in both modes.
  const hasBg = Boolean(backgroundImage?.url);
  const sectionClassName = hasBg
    ? "relative overflow-hidden section-padding-y"
    : "bg-brand-navy section-padding-y";
  const containerClassName = hasBg
    ? "container relative mx-auto container-padding-x"
    : "container mx-auto container-padding-x";

  return (
    <section className={sectionClassName}>
      {/* Full-bleed hero background (mirrors NosotrosHero): object-cover
          <img> + fixed ~50% dark overlay, both BEHIND the content. Rendered
          only when a background image url is set. */}
      {hasBg ? (
        <>
          <img
            src={backgroundImage!.url}
            alt={backgroundImage?.alt ?? ""}
            width={backgroundImage?.width}
            height={backgroundImage?.height}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div aria-hidden className="absolute inset-0 bg-black/50" />
        </>
      ) : null}

      <div className={containerClassName}>
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div className="flex flex-col items-start gap-6">
            {kicker && (
              <span className="font-gotham text-sm font-bold uppercase tracking-wide text-brand-yellow">
                {kicker}
              </span>
            )}
            {headline && (
              <h1 className="font-aku italic text-white text-5xl leading-none lg:text-7xl">
                {headline}
              </h1>
            )}
            {body && (
              <p className="font-gill text-lg text-white/70 lg:max-w-xl">
                {body}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button size="lg" variant="pill" asChild>
                <a href={primaryCtaUrl || "#"}>{primaryCtaLabel}</a>
              </Button>
              <Button size="lg" variant="pill-outline" asChild>
                <a href={secondaryCtaUrl || "#"}>{secondaryCtaLabel}</a>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:mx-auto lg:max-w-md">
            <div className="flex flex-col gap-4 sm:gap-5">
              <HeroServiceTile icon={Plane} label="Carga Aérea" tone="outline" />
              <HeroServiceTile icon={Ship} label="Carga Marítima" tone="solid" />
            </div>
            <div className="flex flex-col gap-4 pt-8 sm:gap-5 lg:pt-16">
              <HeroServiceTile icon={Truck} label="Delivery" tone="solid" />
              <HeroServiceTile
                icon={ClipboardCheck}
                label="Aduanas"
                tone="outline"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Exactly 8 editable fields, ids → camelCase props. `backgroundImage` (first,
// image_picker, optional) toggles the full-bleed background; when unset the
// section keeps its original solid bg-brand-navy design untouched. The 4
// icon tiles above are literal JSX — never props-driven, never listed here.
export const serviciosHeroSettingsSchema = [
  {
    id: "backgroundImage",
    label: "Imagen de fondo",
    type: "image_picker",
    default: undefined,
  },
  {
    id: "kicker",
    label: "Etiqueta superior",
    type: "text",
    default: "Courier en República Dominicana",
  },
  {
    id: "headline",
    label: "Título",
    type: "text",
    default: "Nuestros Servicios",
  },
  {
    id: "body",
    label: "Descripción",
    type: "textarea",
    default:
      "Del pick up en Estados Unidos a la entrega en tu puerta: carga aérea y marítima, gestión aduanal, exportación e importación desde Europa. Todo lo que necesitas para mover tu mercancía, en un solo lugar.",
  },
  {
    id: "primaryCtaLabel",
    label: "Botón principal · Texto",
    type: "text",
    default: "Explora los servicios",
  },
  {
    id: "primaryCtaUrl",
    label: "Botón principal · Enlace",
    type: "url",
    default: "#",
  },
  {
    id: "secondaryCtaLabel",
    label: "Botón secundario · Texto",
    type: "text",
    default: "Cotiza tu envío",
  },
  {
    id: "secondaryCtaUrl",
    label: "Botón secundario · Enlace",
    type: "url",
    default: "#",
  },
];
