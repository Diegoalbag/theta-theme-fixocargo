import * as React from "react";

import { RichText } from "@/lib/rich-text";

// NosotrosMission (NOS-02, D-02) — the About-page mission statement: a two-column
// band with an optional <h2> heading beside a multi-paragraph richtext body. The
// body renders THROUGH `<RichText/>` — the theme's single audited HTML sink
// (`@/lib/rich-text`, 07-02). This section introduces NO new
// dangerouslySetInnerHTML (T-09-01: the richtext-sink audit stays at total count
// 1). The empty/missing body case is delegated to RichText (its own "Sin
// contenido" placeholder), never a blank gap; the `.article-body` scoped CSS
// owns reading typography, so the body is never restyled inline.
//
// Stateless: no useState, no effects, no refs, no event handlers, no render-time
// window/document — renders under node renderToStaticMarkup. The heading is
// React-escaped JSX. Composes below the hero, so its heading is an <h2>. Brand
// tokens only — no hex literals. @/ imports only.
export interface NosotrosMissionProps {
  heading?: string;
  body?: string;
  sectionId?: string;
  sectionName?: string;
}

export const NosotrosMission = ({
  heading,
  body,
}: NosotrosMissionProps): React.ReactNode => {
  return (
    <section className="bg-transparent section-padding-y">
      <div className="container mx-auto container-padding-x">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Heading column — omitted entirely when empty. */}
          <div>
            {heading ? (
              <h2 className="heading-lg font-gotham font-bold uppercase text-brand-navy">
                {heading}
              </h2>
            ) : null}
          </div>

          {/* Body column — the single audited sink. Empty/undefined body →
              RichText renders the "Sin contenido" placeholder (delegated, never
              blank; no new dangerouslySetInnerHTML). */}
          <div className="article-body max-w-2xl">
            <RichText html={body} />
          </div>
        </div>
      </div>
    </section>
  );
};

// Two editable fields, ids → camelCase props. `body` is `richtext` (rich editor
// over sanitized HTML). Spanish labels + defaults per UI-SPEC Copywriting
// Contract.
export const nosotrosMissionSettingsSchema = [
  {
    id: "heading",
    label: "Título",
    type: "text",
    default:
      "Nuestra misión es simple: que enviar y recibir sea fácil para todos.",
  },
  {
    id: "body",
    label: "Contenido",
    type: "richtext",
    default:
      "<p>Empezamos como un pequeño courier con una idea grande: acercar el mundo a las manos de cada persona. Con cada paquete que movemos, acortamos distancias y conectamos a la gente con lo que de verdad importa.</p><p>Combinamos una red logística sólida con tecnología propia, como la Fixo App, para que enviar y recibir sea rápido, seguro y transparente — del mundo a tus manos, con el cuidado y la confianza que mereces.</p>",
  },
];
