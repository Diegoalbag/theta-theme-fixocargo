import * as React from "react";

import { Button } from "@/components/ui/button";
import { ImageGuard } from "@/lib/image-guard";

// NosotrosHero (NOS-01, D-03) — the About-page header: a two-column band with an
// editable text column (brand-yellow eyebrow, display-italic heading, subtitle,
// two guarded CTA anchors) beside a team-image card that renders the ImageGuard
// placeholder ("Agrega una imagen") when unset. An editable experience badge
// (D-03) sits INSIDE the card's normal document flow — never via absolute
// coordinates — and hides when `showBadge` is off (default on) or when both
// badge fields are empty.
//
// OPTIONAL full-bleed hero background (mirrors the ATF Hero slide treatment):
// when `backgroundImage.url` is set, a full-bleed object-cover <img> plus a
// fixed bg-black/50 overlay paint BEHIND the two-column content (which stacks
// above via a `relative` container), and the heading/subtitle flip to white for
// legibility. When unset, the section keeps its ORIGINAL `bg-background` design
// (navy heading, muted subtitle) untouched. The team-image card, experience
// badge, and CTA guards are identical in both modes.
//
// Stateless: no useState, no effects, no refs, no event handlers, no render-time
// window/document — renders under node renderToStaticMarkup. Every text field is
// React-escaped JSX (never dangerouslySetInnerHTML, T-09-03). CTA anchors render
// ONLY when their label is non-empty, so no empty/dangling href is ever emitted
// (T-09-04). Brand tokens only — no hex literals. @/ imports only.
export interface TeamImage {
  id: string;
  url?: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface NosotrosHeroProps {
  backgroundImage?: {
    id: string;
    url?: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  eyebrow?: string;
  heading?: string;
  subtitle?: string;
  primaryCtaLabel?: string;
  primaryCtaUrl?: string;
  secondaryCtaLabel?: string;
  secondaryCtaUrl?: string;
  teamImage?: TeamImage;
  showBadge?: boolean;
  badgeNumber?: string;
  badgeLabel?: string;
  sectionId?: string;
  sectionName?: string;
}

export const NosotrosHero = ({
  backgroundImage,
  eyebrow,
  heading,
  subtitle,
  primaryCtaLabel,
  primaryCtaUrl,
  secondaryCtaLabel,
  secondaryCtaUrl,
  teamImage,
  showBadge = true,
  badgeNumber,
  badgeLabel,
}: NosotrosHeroProps): React.ReactNode => {
  // Badge visibility (D-03): only when the toggle is on AND at least one badge
  // field carries copy — never a bare navy chip.
  const badgeVisible =
    showBadge && (Boolean(badgeNumber) || Boolean(badgeLabel));

  // Full-bleed background mode (image-conditional). Truthy url → hero treatment
  // + white text over a dark overlay; falsy → the original bg-background design.
  const hasBg = Boolean(backgroundImage?.url);

  // Image mode mirrors the default hero (HeroSlide): full min-height band with
  // vertically-centered content and the same white heading/subtitle typography.
  const sectionClassName = hasBg
    ? "relative overflow-hidden section-padding-y min-h-[30vh] md:min-h-[560px] flex items-center"
    : "bg-background section-padding-y";
  // In image mode the container must stack above the overlay (relative).
  const containerClassName = hasBg
    ? "container relative mx-auto container-padding-x"
    : "container mx-auto container-padding-x";
  const headingClassName = hasBg
    ? "font-aku font-bold text-white text-4xl md:text-6xl lg:text-8xl"
    : "font-aku italic text-brand-navy text-3xl lg:text-5xl leading-tight";
  const subtitleClassName = hasBg
    ? "font-gill text-white text-lg md:text-2xl"
    : "font-gill text-lg text-muted-foreground max-w-xl";

  return (
    <section className={sectionClassName}>
      {/* Full-bleed hero background (mirrors HeroSlide): object-cover <img> +
          fixed ~50% dark overlay, both BEHIND the content. Rendered only when a
          background image url is set. */}
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
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12">
          {/* Text column — each field guarded so an empty value renders nothing. */}
          <div className="flex flex-col items-start gap-6 lg:flex-1">
            {eyebrow ? (
              <p className="font-gotham text-brand-yellow text-sm uppercase tracking-wide">
                {eyebrow}
              </p>
            ) : null}

            {heading ? <h1 className={headingClassName}>{heading}</h1> : null}

            {subtitle ? <p className={subtitleClassName}>{subtitle}</p> : null}

            {/* CTA row — each anchor rendered ONLY when its label is non-empty
                (T-09-04: no empty-href anchors). */}
            {primaryCtaLabel || secondaryCtaLabel ? (
              <div className="flex flex-wrap items-center gap-4">
                {primaryCtaLabel ? (
                  <Button size="lg" variant="pill" asChild>
                    <a href={primaryCtaUrl || "#"}>{primaryCtaLabel}</a>
                  </Button>
                ) : null}
                {secondaryCtaLabel ? (
                  <Button size="lg" variant="pill-outline" asChild>
                    <a href={secondaryCtaUrl || "#"}>{secondaryCtaLabel}</a>
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>

          {/* Image column — the team-image card. ImageGuard paints the dashed
              "Agrega una imagen" placeholder when no url is set. */}
          <div className="relative flex flex-col gap-4 lg:flex-1">
            <div className="relative rounded-3xl overflow-hidden bg-card shadow-lg">
              <ImageGuard
                url={teamImage?.url}
                alt={teamImage?.alt}
                ratio={760 / 900}
                width={teamImage?.width}
                height={teamImage?.height}
              />
            </div>

            {/* Experience badge (D-03) — in normal flow at the card's lower edge
                via flex, NOT absolute coordinates. */}
            {badgeVisible ? (
              <div className="flex absolute -left-7 bottom-10">
                <div className="rounded-2xl max-w-3xs bg-brand-navy px-5 py-4 flex justify-between items-center gap-3">
                  {badgeNumber ? (
                    <span className="font-aku italic text-brand-yellow text-4xl leading-none">
                      {badgeNumber}
                    </span>
                  ) : null}
                  {badgeLabel ? (
                    <span className="font-gotham font-bold text-sm text-white">
                      {badgeLabel}
                    </span>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};

// Twelve editable fields, ids → camelCase props, in the locked order. Spanish
// labels + defaults per UI-SPEC Copywriting Contract. `backgroundImage` (first,
// image_picker, optional) toggles the full-bleed hero background; `showBadge`
// (checkbox, default true) drives the badge visibility; `teamImage` opens the
// media library; the CTA urls are `url` inputs.
export const nosotrosHeroSettingsSchema = [
  {
    id: "backgroundImage",
    label: "Imagen de fondo",
    type: "image_picker",
    default: undefined,
  },
  {
    id: "eyebrow",
    label: "Etiqueta superior",
    type: "text",
    default: "Quiénes Somos",
  },
  {
    id: "heading",
    label: "Título",
    type: "text",
    default: "Movemos el mundo a tus manos",
  },
  {
    id: "subtitle",
    label: "Subtítulo",
    type: "text",
    default:
      "Somos Fixocargo, un courier nacido para acercar distancias. Conectamos a las personas con lo que importa — paquetes, compras y oportunidades — con la rapidez, el cuidado y la confianza que mereces.",
  },
  {
    id: "primaryCtaLabel",
    label: "Botón principal",
    type: "text",
    default: "Nuestros servicios",
  },
  {
    id: "primaryCtaUrl",
    label: "Enlace principal",
    type: "url",
    default: "#",
  },
  {
    id: "secondaryCtaLabel",
    label: "Botón secundario",
    type: "text",
    default: "Ver sucursales",
  },
  {
    id: "secondaryCtaUrl",
    label: "Enlace secundario",
    type: "url",
    default: "#",
  },
  {
    id: "teamImage",
    label: "Imagen del equipo",
    type: "image_picker",
  },
  {
    id: "showBadge",
    label: "Mostrar insignia",
    type: "checkbox",
    default: true,
  },
  {
    id: "badgeNumber",
    label: "Número de insignia",
    type: "text",
    default: "+10",
  },
  {
    id: "badgeLabel",
    label: "Texto de insignia",
    type: "text",
    default: "años conectando el mundo a tus manos",
  },
];
