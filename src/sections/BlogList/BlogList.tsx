import * as React from "react";
import { ArrowRight } from "lucide-react";

import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BlocksSlot } from "@/lib/blocks-slot";
import { ImageGuard } from "@/lib/image-guard";

// BlogList (BLG-03, BLG-04, BLG-05) — the stateless Blog index. Pure composition
// of three shipped patterns: Blogs (grid + BlocksSlot + SectionHeading), BlogHero
// (showSearch → showFeatured toggle + inert decorative control) and BlogCard (two
// conditional tag pills + ImageGuard + real anchor).
//
// Body order: (1) optional light SectionHeading; (2) decorative chip row — up to
// six labels, empty labels skipped, the `activeChip` (1-based) rendered as a navy
// pill and the rest as bordered pills; (3) a toggleable featured post (ImageGuard
// placeholder + two conditional tags + real "Leer artículo" link); (4) the card
// grid — a single BlocksSlot with the DEFAULT EmptyState kept (never overridden
// away); (5) a load-more that is a real navy anchor when a URL is set and
// an inert navy span otherwise (no dead `#` navigation).
//
// Stateless: no useState, no effects, no refs, no event handlers. Chips and the
// empty load-more are purely presentational. Brand tokens only — no hex literals,
// no coordinate offsets. @/ imports only. Renders under node renderToStaticMarkup.
export interface BlogListProps {
  // Category chips (D-05/06/07).
  chip1Label?: string;
  chip2Label?: string;
  chip3Label?: string;
  chip4Label?: string;
  chip5Label?: string;
  chip6Label?: string;
  activeChip?: string;
  // Featured post (D-08/09).
  showFeatured?: boolean;
  featuredImage?: {
    id: string;
    url?: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  featuredTagNavy?: string;
  featuredTagYellow?: string;
  featuredDate?: string;
  featuredTitle?: string;
  featuredExcerpt?: string;
  featuredLinkLabel?: string;
  featuredLinkUrl?: string;
  // Load more (D-11).
  loadMoreLabel?: string;
  loadMoreUrl?: string;
  // Optional heading above the chips.
  heading?: string;
  subtitle?: string;
  // Platform-injected.
  renderBlocks?: () => React.ReactNode;
  sectionId?: string;
  sectionName?: string;
}

export const BlogList = ({
  chip1Label,
  chip2Label,
  chip3Label,
  chip4Label,
  chip5Label,
  chip6Label,
  activeChip = "1",
  showFeatured = true,
  featuredImage,
  featuredTagNavy,
  featuredTagYellow,
  featuredDate,
  featuredTitle,
  featuredExcerpt,
  featuredLinkLabel = "Leer artículo",
  featuredLinkUrl,
  loadMoreLabel = "Cargar más artículos",
  loadMoreUrl,
  heading,
  subtitle,
  renderBlocks,
}: BlogListProps): React.ReactNode => {
  const chips = [
    chip1Label,
    chip2Label,
    chip3Label,
    chip4Label,
    chip5Label,
    chip6Label,
  ];
  // `activeChip` is a 1-based string from the select; convert to a 0-based index.
  const activeIndex = parseInt(activeChip, 10) - 1;

  return (
    <section className="bg-transparent section-padding-y">
      <div className="container mx-auto container-padding-x">
        {/* Optional light heading — rendered only when a heading prop is present
            so an empty header emits no <h2> (BlogHero:57 precedent). */}
        {heading ? (
          <SectionHeading
            variant="light"
            title={heading}
            subtitle={subtitle}
          />
        ) : null}

        {/* Decorative chip row (D-05/06/07). Chips are inert <span>s — no href,
            no handlers (BlogHero search precedent). Empty labels are skipped. */}
        <div className="flex flex-wrap gap-3">
          {chips.map((label, index) =>
            label ? (
              index === activeIndex ? (
                <span
                  key={index}
                  className="rounded-full bg-brand-navy px-5 py-1.5 font-gotham text-sm font-bold text-white"
                >
                  {label}
                </span>
              ) : (
                <span
                  key={index}
                  className="rounded-full border border-border bg-card px-5 py-1.5 font-gotham text-sm font-bold text-brand-navy"
                >
                  {label}
                </span>
              )
            ) : null,
          )}
        </div>

        {/* Featured post (D-08/09) — a pure conditional mirroring showSearch, not
            state. Defaults on. */}
        {showFeatured ? (
          <Card
            variant="surface"
            className="mt-8 flex flex-col overflow-hidden p-0 lg:flex-row"
          >
            <div className="relative lg:w-1/2">
              <ImageGuard
                url={featuredImage?.url}
                alt={featuredImage?.alt ?? ""}
                ratio={760 / 450}
              />

              {/* Two conditional tags stacked (navy over yellow); each renders
                  ONLY when its value is present (BlogCard:52-61 pattern). */}
              <div className="absolute left-4 top-4 flex flex-col items-start gap-1">
                {featuredTagNavy && (
                  <span className="rounded-full bg-brand-navy px-3 py-1 font-gotham text-xs font-bold text-white">
                    {featuredTagNavy}
                  </span>
                )}
                {featuredTagYellow && (
                  <span className="rounded-full bg-brand-yellow px-3 py-1 font-gotham text-xs font-bold text-brand-navy">
                    {featuredTagYellow}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col justify-center gap-3 p-6 lg:w-1/2">
              {featuredDate && (
                <span className="font-gotham text-sm font-bold tracking-wide text-brand-yellow">
                  {featuredDate}
                </span>
              )}

              {featuredTitle && (
                <h3 className="font-aku text-3xl font-bold leading-tight text-brand-navy">
                  {featuredTitle}
                </h3>
              )}

              {featuredExcerpt && (
                <p className="font-gill text-muted-foreground">
                  {featuredExcerpt}
                </p>
              )}

              <Button
                variant="link"
                asChild
                className="mt-2 self-start text-brand-navy"
              >
                <a className="font-bold!" href={featuredLinkUrl || "#"}>
                  {featuredLinkLabel}
                  <ArrowRight className="text-brand-yellow" aria-hidden="true" />
                </a>
              </Button>
            </div>
          </Card>
        ) : null}

        {/* Card grid (D-10) — a single BlocksSlot; layout on the wrapper only.
            The DEFAULT EmptyState is KEPT so a zero-card section shows "Sin
            elementos" (the empty override is never supplied). */}
        <BlocksSlot
          renderBlocks={renderBlocks}
          className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        />

        {/* Load more (D-11) — a real navy anchor when a URL is set, else an inert
            navy span (no dead `#` anchor). Centered below the grid. */}
        <div className="mt-10 flex justify-center">
          {loadMoreUrl ? (
            <Button variant="navy" asChild>
              <a href={loadMoreUrl}>{loadMoreLabel}</a>
            </Button>
          ) : (
            <span className="rounded-full bg-brand-navy px-6 py-2.5 font-gotham font-bold text-white">
              {loadMoreLabel}
            </span>
          )}
        </div>
      </div>
    </section>
  );
};

// Editable fields, ids → camelCase props. Spanish labels/defaults per the UI-SPEC
// Copywriting Contract and the BlogList design comp featured copy.
export const blogListSettingsSchema = [
  {
    id: "chip1Label",
    label: "Categoría 1",
    type: "text",
    default: "Todos",
  },
  {
    id: "chip2Label",
    label: "Categoría 2",
    type: "text",
    default: "Envíos & Logística",
  },
  {
    id: "chip3Label",
    label: "Categoría 3",
    type: "text",
    default: "Compras en el Exterior",
  },
  {
    id: "chip4Label",
    label: "Categoría 4",
    type: "text",
    default: "Promociones",
  },
  {
    id: "chip5Label",
    label: "Categoría 5",
    type: "text",
    default: "Guías Fixo",
  },
  {
    id: "chip6Label",
    label: "Categoría 6",
    type: "text",
    default: "Comunidad",
  },
  {
    id: "activeChip",
    label: "Categoría activa",
    type: "select",
    default: "1",
    options: [
      { value: "1", label: "Categoría 1" },
      { value: "2", label: "Categoría 2" },
      { value: "3", label: "Categoría 3" },
      { value: "4", label: "Categoría 4" },
      { value: "5", label: "Categoría 5" },
      { value: "6", label: "Categoría 6" },
    ],
  },
  {
    id: "showFeatured",
    label: "Mostrar destacado",
    type: "checkbox",
    default: true,
  },
  {
    id: "featuredImage",
    label: "Imagen destacada",
    type: "image_picker",
  },
  {
    id: "featuredTagNavy",
    label: "Etiqueta principal",
    type: "text",
    default: "Artículo",
  },
  {
    id: "featuredTagYellow",
    label: "Etiqueta secundaria",
    type: "text",
    default: "Destacado",
  },
  {
    id: "featuredDate",
    label: "Fecha / lectura",
    type: "text",
    default: "Compras en el Exterior · 8 min de lectura",
  },
  {
    id: "featuredTitle",
    label: "Título destacado",
    type: "text",
    default: "Recibe tus compras desde Europa con Fixo Cargo",
  },
  {
    id: "featuredExcerpt",
    label: "Resumen destacado",
    type: "textarea",
    default:
      "Ahora puedes comprar en tus tiendas favoritas de España y Europa y recibirlos en casa usando nuestra nueva dirección en Madrid. Te explicamos paso a paso cómo aprovecharlos y qué debes saber antes de tu primer envío.",
  },
  {
    id: "featuredLinkLabel",
    label: "Texto del enlace",
    type: "text",
    default: "Leer artículo",
  },
  {
    id: "featuredLinkUrl",
    label: "Enlace destacado",
    type: "url",
    default: "#",
    placeholder: "https://…",
  },
  {
    id: "loadMoreLabel",
    label: "Texto cargar más",
    type: "text",
    default: "Cargar más artículos",
  },
  {
    id: "loadMoreUrl",
    label: "Enlace cargar más",
    type: "url",
    default: "",
    placeholder: "https://…",
  },
];
