import * as React from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";

// FaqPill (INF-02) — section-local block for the EnviosNacionales dark band.
// A rounded "pill" row that ALWAYS renders its question text plus a "Buscar"
// action. The Buscar action is a real yellow-pill `<a href={url}>` ONLY when
// `url` is set; when `url` is empty it degrades to an inert `disabled` button
// wrapping a <span> so the output never emits an empty `href=""` anchor (D-05,
// T-05-07). The question always renders regardless of url.
//
// No state, no event handlers, no hex literals, @/ imports only.
export interface FaqPillProps {
  question?: string;
  url?: string;
  blockId?: string;
  blockType?: string;
}

export const FaqPill = ({
  question = "¿Cómo funciona?",
  url = "#",
}: FaqPillProps): React.ReactNode => {
  return (
    <div className="flex items-center gap-4 rounded-full bg-card border border-border px-6 py-3">
      {/* Decorative leading icon: white glyph on a brand-yellow circle. */}
      <span
        aria-hidden="true"
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-yellow text-white"
      >
        <Search className="size-4" />
      </span>
      <span className="flex-1 font-gotham font-bold text-brand-navy">
        {question}
      </span>

      {url ? (
        <Button variant="pill" asChild>
          <a href={url}>Buscar</a>
        </Button>
      ) : (
        <Button variant="pill" disabled>
          <span>Buscar</span>
        </Button>
      )}
    </div>
  );
};

// Exactly 2 editable fields, ids → camelCase props.
export const faqPillSettingsSchema = [
  {
    id: "question",
    label: "Pregunta",
    type: "text",
    default: "¿Cómo funciona?",
  },
  {
    id: "url",
    label: "Enlace de búsqueda",
    type: "url",
    default: "#",
    placeholder: "https://…",
  },
];
