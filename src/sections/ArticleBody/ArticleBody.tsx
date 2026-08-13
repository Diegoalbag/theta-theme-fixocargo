import * as React from "react";

import { RichText } from "@/lib/rich-text";
import type { ArticleProp } from "@/theme-contract";

// ArticleBody (ART-01, ART-02, ART-03) — the shared richtext section, composable
// on both the Legal/policies page and the Blog-article page. An OPTIONAL <h1>
// heading (hidden when empty so it composes cleanly under a blog-hero that
// already carries the title), an OPTIONAL free-text date line, and the richtext
// body rendered THROUGH `<RichText/>` — the theme's single audited HTML sink
// (`@/lib/rich-text`, 07-02). This section introduces NO new
// dangerouslySetInnerHTML; the empty/missing body case is delegated to RichText
// (the "Sin contenido" placeholder), never a blank gap.
//
// TWO CONTENT SOURCES, one renderer. This section is also the reserved
// `article-body` slot of the platform's `article` template (project-theta-fe
// Phase 21, D-06). When the platform injects a real post it arrives as the
// `article` prop and WINS over the authored settings; when it does not — the
// Legal/policies pages, which have no post — the authored `body`/`heading`
// fields drive exactly as before. That precedence is the whole migration: a
// page keeps working untouched, a post renders itself.
//
// `article.body` is already sanitized server-side by the platform (Phase 20)
// and that sanitizer is the ONLY gate — this section neither re-sanitizes nor
// unescapes it, it simply routes it through the same audited RichText sink, so
// the 07-02 sink audit stays at exactly one dangerouslySetInnerHTML.
//
// Stateless: no useState, no effects, no refs, no event handlers. All content
// arrives as props; renders under node renderToStaticMarkup. The content column
// is capped at `max-w-3xl` — the reading-measure legibility constraint. Brand
// tokens only — no hex literals. @/ imports only.
export interface ArticleBodyProps {
  heading?: string;
  lastUpdated?: string;
  body?: string;
  /** Platform-injected published post. Present on an `article` template,
   * absent on an ordinary page. Wins over the authored fields when present. */
  article?: ArticleProp | null;
  sectionId?: string;
  sectionName?: string;
}

export const ArticleBody = ({
  heading,
  lastUpdated,
  body,
  article,
}: ArticleBodyProps): React.ReactNode => {
  // Injected post wins; authored settings are the fallback for pages that have
  // no post. `article.body` is only preferred when it is genuinely non-empty,
  // so an empty post body cannot blank a page that authored real content.
  const resolvedBody = article?.body ? article.body : body;
  const resolvedHeading = article?.title ? article.title : heading;

  return (
    <section className="bg-transparent section-padding-y">
      <div className="container mx-auto container-padding-x max-w-3xl">
        {/* Optional heading (D-07) — omitted entirely when empty. On an
            `article` template this is the post's own title. */}
        {resolvedHeading ? (
          <h1 className="heading-lg font-gotham text-brand-navy mb-2">
            {resolvedHeading}
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
        <RichText html={resolvedBody} />
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
