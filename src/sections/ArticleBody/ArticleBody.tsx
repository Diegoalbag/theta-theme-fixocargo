import * as React from "react";

import { RichText } from "@/lib/rich-text";

// ArticleBody (ART-01, ART-02, ART-03) — the shared richtext section, composable
// on both the Legal/policies page and the Blog-article page. An OPTIONAL <h1>
// heading (hidden when empty so it composes cleanly under a blog-hero that
// already carries the title), an OPTIONAL free-text date line, and the richtext
// body rendered THROUGH `<RichText/>` — the theme's single audited HTML sink
// (`@/lib/rich-text`, 07-02). This section introduces NO new
// dangerouslySetInnerHTML; the empty/missing body case is delegated to RichText
// (the "Sin contenido" placeholder), never a blank gap.
//
// Stateless: no useState, no effects, no refs, no event handlers. All content
// arrives as props; renders under node renderToStaticMarkup. The content column
// is capped at `max-w-3xl` — the reading-measure legibility constraint. Brand
// tokens only — no hex literals. @/ imports only.
export interface ArticleBodyProps {
  heading?: string;
  lastUpdated?: string;
  body?: string;
  sectionId?: string;
  sectionName?: string;
}

export const ArticleBody = ({
  heading,
  lastUpdated,
  body,
}: ArticleBodyProps): React.ReactNode => {
  return (
    <section className="bg-transparent section-padding-y">
      <div className="container mx-auto container-padding-x max-w-3xl">
        {/* Optional heading (D-07) — omitted entirely when empty. */}
        {heading ? (
          <h1 className="heading-lg font-gotham text-brand-navy mb-2">
            {heading}
          </h1>
        ) : null}

        {/* Optional free-text date line (D-06) — merchant types the full string
            incl. the label (e.g. "Actualizado: 28/06/2026"). */}
        {lastUpdated ? (
          <p className="font-opensans text-sm text-muted-foreground mb-6">
            {lastUpdated}
          </p>
        ) : null}

        {/* Body — the single audited sink. Empty/undefined body → RichText
            renders the "Sin contenido" placeholder (delegated, never blank). */}
        <RichText html={body} />
      </div>
    </section>
  );
};

// Three editable fields, ids → camelCase props. `body` is `richtext` (rich
// editor) over raw `html` per D-08; `lastUpdated` is free text incl. its label.
export const articleBodySettingsSchema = [
  {
    id: "heading",
    label: "Título (opcional)",
    type: "text",
    default: "",
  },
  {
    id: "lastUpdated",
    label: "Última actualización",
    type: "text",
    default: "",
    placeholder: "Actualizado: 28/06/2026",
  },
  {
    id: "body",
    label: "Contenido",
    type: "richtext",
    default: "",
  },
];
