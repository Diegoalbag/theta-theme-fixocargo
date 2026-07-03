import * as React from "react";
import { Search } from "lucide-react";

import { SectionHeading } from "@/components/ui/section-heading";

// BlogHero (BLG-01, ART-04) — one reusable header that serves the Blog index
// (search ON) and the Blog-article / Legal headers (search OFF → article-header
// date line) from a single registered section. The `showSearch` toggle (D-05,
// Pattern 5) switches between a DECORATIVE search pill and a small date line — a
// pure conditional, never state.
//
// Two visual modes, image-conditional on `backgroundImage?.url`:
//   • IMAGE MODE (url truthy) — mirrors the Hero slide (src/blocks/HeroSlide):
//     a full-bleed background image + fixed ~50% dark overlay behind a
//     LEFT-aligned content column.
//   • NO-IMAGE MODE (url falsy) — the original solid `bg-brand-navy` centered
//     band, unchanged (this is what the Article / Legal page headers use).
// The image_picker value is defensive — it can arrive as `{}` or a string in the
// customizer, so a falsy `.url` is treated as "no image".
//
// SectionHeading variant="dark" renders the white title/subtitle; the eyebrow is
// rendered SEPARATELY above in brand-yellow because the dark SectionHeading
// eyebrow is white and UI-SPEC reserves brand-yellow for the eyebrow.
//
// Stateless: no useState, no effects, no refs, no event handlers. The search
// input is inert — readOnly / aria-hidden / tabIndex=-1, NO onChange/onClick
// (the v1.0 Sucursales precedent). Renders under node renderToStaticMarkup.
// Brand tokens only — no hex literals. @/ imports only.
export interface BlogHeroProps {
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
  showSearch?: boolean;
  searchPlaceholder?: string;
  searchButtonLabel?: string;
  date?: string;
  sectionId?: string;
  sectionName?: string;
}

export const BlogHero = ({
  backgroundImage,
  eyebrow,
  heading,
  subtitle,
  showSearch = true,
  searchPlaceholder,
  searchButtonLabel,
  date,
}: BlogHeroProps): React.ReactNode => {
  // Defensive url-guard — image_picker can arrive as `{}` or a string in the
  // customizer, so a falsy `.url` means "no image" → the navy band.
  const hasImage = Boolean(backgroundImage?.url);

  // In the navy band the search pill is centered (`mx-auto`); in image mode it
  // sits left-aligned within the content column. Keeping the segment inline (not
  // via cn) preserves the navy-mode class order byte-for-byte.
  const searchPillAlign = hasImage ? "" : " mx-auto";

  // Shared inner content — eyebrow → dark SectionHeading → search-pill-OR-date.
  // Reused by both modes; only the outer wrapper's alignment differs.
  const content = (
    <>
      {/* Eyebrow — its own brand-yellow element above the title (UI-SPEC
          reserves yellow for the eyebrow; the dark SectionHeading eyebrow is
          white). Omitted when empty. */}
      {eyebrow ? (
        <p className="font-gotham text-brand-yellow text-sm uppercase tracking-wide">
          {eyebrow}
        </p>
      ) : null}

      {/* Title + subtitle via the dark SectionHeading — rendered only when
          the heading is non-empty so an empty header emits no <h2>. */}
      {heading ? (
        <SectionHeading variant="dark" title={heading} subtitle={subtitle} />
      ) : null}

      {/* showSearch toggle (D-05, Pattern 5) — a pure conditional, no state. */}
      {showSearch ? (
        // Search ON — the decorative, inert pill (Sucursales precedent).
        <div
          className={`mt-6 max-w-xl${searchPillAlign} flex items-center gap-2 rounded-full bg-card px-5 h-[60px]`}
        >
          <Search aria-hidden="true" className="size-4 text-muted-foreground" />
          <input
            type="text"
            readOnly
            aria-hidden="true"
            tabIndex={-1}
            placeholder={searchPlaceholder}
            className="flex-1 bg-transparent outline-none text-muted-foreground"
          />
          <span className="rounded-full bg-brand-yellow px-4 py-2 font-gotham font-bold text-brand-navy">
            {searchButtonLabel}
          </span>
        </div>
      ) : date ? (
        // Search OFF — the article-header variant: a single small date line,
        // rendered only when date is non-empty.
        <p className="font-opensans text-sm text-white/70 mt-4">{date}</p>
      ) : null}
    </>
  );

  // IMAGE MODE — mirror HeroSlide: full-bleed image + dark overlay behind a
  // LEFT-aligned content column. Text stays white; eyebrow stays brand-yellow.
  if (hasImage) {
    return (
      <section className="relative flex items-center overflow-hidden min-h-[30vh] md:min-h-[560px]">
        <img
          src={backgroundImage!.url}
          alt={backgroundImage!.alt ?? ""}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Fixed ~50% dark overlay (matches HeroSlide rgba(0,0,0,0.5)). */}
        <div aria-hidden className="absolute inset-0 bg-black/50" />

        {/* Content layer — LEFT-aligned column, vertically centered via the
            section's items-center. */}
        <div className="container relative mx-auto container-padding-x">
          <div className="max-w-3xl flex flex-col items-start">{content}</div>
        </div>
      </section>
    );
  }

  // NO-IMAGE MODE — the original solid navy band, centered (unchanged).
  return (
    <section className="bg-brand-navy section-padding-y">
      <div className="container mx-auto container-padding-x text-center">
        <div className="max-w-3xl mx-auto">{content}</div>
      </div>
    </section>
  );
};

// Seven editable fields, ids → camelCase props. `showSearch` (checkbox, default
// true) drives the index-vs-article-header variant; the search copy + the date
// line are free text. Spanish defaults per UI-SPEC Copywriting Contract.
export const blogHeroSettingsSchema = [
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
    default: "Novedades · Tips · Comunidad",
  },
  {
    id: "heading",
    label: "Título",
    type: "text",
    default: "BLOG",
  },
  {
    id: "subtitle",
    label: "Subtítulo",
    type: "text",
    default:
      "Guías de envío, novedades del mundo courier y todo lo que necesitas para mover tus paquetes con confianza — del mundo a tus manos.",
  },
  {
    id: "showSearch",
    label: "Mostrar buscador",
    type: "checkbox",
    default: true,
  },
  {
    id: "searchPlaceholder",
    label: "Texto del buscador",
    type: "text",
    default: "Buscar artículos, guías, novedades…",
  },
  {
    id: "searchButtonLabel",
    label: "Botón del buscador",
    type: "text",
    default: "Buscar",
  },
  {
    id: "date",
    label: "Fecha",
    type: "text",
    default: "",
    placeholder: "Publicado: 28/06/2026",
  },
];
