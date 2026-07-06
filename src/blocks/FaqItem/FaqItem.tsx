import * as React from "react";
import { ChevronDown } from "lucide-react";

import { RichText } from "@/lib/rich-text";

// FaqItem — section-local block for the Faq band. A no-JS native
// <details name="faq">/<summary> EXCLUSIVE accordion: its initial expanded
// state simply follows the `isExpanded` prop, and the constant `name="faq"`
// makes the platform's <details> group one-open-at-a-time with ZERO client JS
// (opening one item auto-closes any sibling that shares the name).
//
// The answer renders through the theme's SINGLE audited RichText sink — the
// only HTML-injection sink in the codebase (pinned by
// test/richtext-sink-audit.test.ts). A blank answer is GUARDED so it renders
// NOTHING (never RichText's "Sin contenido" placeholder).
//
// CAVEAT (stateless constraint): `name="faq"` is a CONSTANT. Blocks are
// stateless and cannot scope the group name per section instance, so two `faq`
// sections on ONE page would SHARE exclusivity — opening an item in one closes
// items in the other. This is accepted for the normal one-FAQ-per-page case.
//
// No state, no event handlers, no hex literals, @/ imports only.
export interface FaqItemProps {
  question?: string;
  answer?: string;
  isExpanded?: boolean;
  blockId?: string;
  blockType?: string;
}

export const FaqItem = ({
  question = "",
  answer = "",
  isExpanded = false,
}: FaqItemProps): React.ReactNode => {
  return (
    <details
      name="faq"
      open={isExpanded}
      className="group rounded-2xl border border-border bg-card shadow-sm px-6 py-4"
    >
      <summary className="list-none cursor-pointer flex items-center justify-between gap-4 [&::-webkit-details-marker]:hidden marker:content-['']">
        <span className="font-gotham font-bold text-brand-navy">{question}</span>
        <ChevronDown
          aria-hidden="true"
          className="size-5 text-brand-navy transition-transform group-open:rotate-180"
        />
      </summary>

      {/* Guarded: a blank answer renders NOTHING (never RichText's "Sin
          contenido"). RichText is the theme's ONLY sanitizing sink. */}
      {answer && <RichText html={answer} className="mt-3" />}
    </details>
  );
};

// Exactly 3 editable fields, ids → camelCase props. Spanish labels.
export const faqItemSettingsSchema = [
  {
    id: "question",
    label: "Pregunta",
    type: "text",
    default: "",
  },
  {
    id: "answer",
    label: "Respuesta",
    type: "richtext",
    default: "",
  },
  {
    id: "isExpanded",
    label: "Expandido por defecto",
    type: "checkbox",
    default: false,
  },
];
