import * as React from "react";
import { Search } from "lucide-react";

import { SectionHeading } from "@/components/ui/section-heading";

// BlogHero (BLG-01, ART-04) — one reusable navy header that serves the Blog
// index (search ON) and the Blog-article / Legal headers (search OFF →
// article-header date line) from a single registered section. The `showSearch`
// toggle (D-05, Pattern 5) switches between a DECORATIVE search pill and a small
// date line — a pure conditional, never state.
//
// Background is a solid `bg-brand-navy` band (UI-SPEC: no image field in scope).
// SectionHeading variant="dark" renders the white title/subtitle; the eyebrow is
// rendered SEPARATELY above in brand-yellow because the dark SectionHeading
// eyebrow is white and UI-SPEC reserves brand-yellow for the eyebrow.
//
// Stateless: no useState, no effects, no refs, no event handlers. The search
// input is inert — readOnly / aria-hidden / tabIndex=-1, NO onChange/onClick
// (the v1.0 Sucursales precedent). Renders under node renderToStaticMarkup.
// Brand tokens only — no hex literals. @/ imports only.
export interface BlogHeroProps {
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
  eyebrow,
  heading,
  subtitle,
  showSearch = true,
  searchPlaceholder,
  searchButtonLabel,
  date,
}: BlogHeroProps): React.ReactNode => {
  return (
    <section className="bg-brand-navy section-padding-y">
      <div className="container mx-auto container-padding-x text-center">
        <div className="max-w-3xl mx-auto">
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
            <SectionHeading
              variant="dark"
              title={heading}
              subtitle={subtitle}
            />
          ) : null}

          {/* showSearch toggle (D-05, Pattern 5) — a pure conditional, no state. */}
          {showSearch ? (
            // Search ON — the decorative, inert pill (Sucursales precedent).
            <div className="mt-6 max-w-xl mx-auto flex items-center gap-2 rounded-full bg-card px-5 h-[60px]">
              <Search
                aria-hidden="true"
                className="size-4 text-muted-foreground"
              />
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
        </div>
      </div>
    </section>
  );
};

// Seven editable fields, ids → camelCase props. `showSearch` (checkbox, default
// true) drives the index-vs-article-header variant; the search copy + the date
// line are free text. Spanish defaults per UI-SPEC Copywriting Contract.
export const blogHeroSettingsSchema = [
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
