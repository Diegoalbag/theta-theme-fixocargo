import * as React from "react";
import { ChevronDown, MessageCircleQuestionMark } from "lucide-react";

import { IconChip } from "@/components/ui/icon-chip";
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
      // `<summary>` MUST stay a direct child of `<details>` for the native
      // disclosure toggle to work, so the open-state accent border can't live
      // on a wrapping descendant (that would require `group-open:`, which only
      // matches descendants of an open `.group`, never the group element
      // itself). Instead this uses Tailwind's `open:` variant, which targets
      // the element's OWN `[open]` attribute directly — no wrapper needed.
      className="group rounded-2xl border-2 border-transparent bg-card shadow-sm px-6 py-4 transition-colors open:border-brand-yellow"
    >
      <summary className="list-none cursor-pointer flex items-center justify-between gap-4 [&::-webkit-details-marker]:hidden marker:content-['']">
        <span className="flex items-center gap-4">
          <IconChip background="navy" size="md">
            <MessageCircleQuestionMark
              aria-hidden="true"
              className="text-brand-yellow"
            />
          </IconChip>
          <span className="font-gotham font-bold text-brand-navy">
            {question}
          </span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className="size-5 text-brand-navy transition-transform group-open:rotate-180 group-open:text-brand-yellow"
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
