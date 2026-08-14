import * as React from "react";
import { ChevronDown, MessageCircleQuestionMark } from "lucide-react";

import { IconChip } from "@/components/ui/icon-chip";
import { RichText } from "@/lib/rich-text";
import { safeAnchorId } from "@/lib/safe-anchor";
import { cn } from "@/lib/utils";

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
// DEEP LINKS (260814-a07): an optional merchant-typed `anchorId` renders as the
// `id` on this <details>, so `site.com/faq-page#q4` is a real fragment target
// even with JS off. A blank anchor normalizes to `undefined`, which React drops
// entirely — that is the back-compat mechanism, so every faq-item saved before
// this field existed still renders with NO id attribute and an unchanged class
// string. One guarded effect then forces the targeted item OPEN (native
// fragment auto-expand of <details> is recent-browsers-only) on initial load
// and on hashchange; `name="faq"` exclusivity closes whichever sibling was open,
// so there is no manual close loop.
//
// The effect resolves its target BY REF, never by querying the document. That
// is deliberate and load-bearing: with no lookup there is no selector to
// interpolate a merchant string into (the CR-02 scar from 260813-fe3) and
// nothing walks outward from the block root into the customizer's wrapper
// element (CR-01). The merchant value and the URL fragment are only ever
// COMPARED, both normalized through the same safeAnchorId.
//
// No React state, no hex literals, no render-time window/document access,
// @/ imports only.
export interface FaqItemProps {
  question?: string;
  answer?: string;
  isExpanded?: boolean;
  anchorId?: string;
  blockId?: string;
  blockType?: string;
}

export const FaqItem = ({
  question = "",
  answer = "",
  isExpanded = false,
  anchorId = "",
}: FaqItemProps): React.ReactNode => {
  const anchor = safeAnchorId(anchorId);
  const detailsRef = React.useRef<HTMLDetailsElement>(null);

  React.useEffect(() => {
    const el = detailsRef.current;
    // An un-anchored item subscribes to nothing at all.
    if (!anchor || !el) return;

    const openIfTargeted = () => {
      const raw = window.location.hash.slice(1);
      if (!raw) return;
      let fragment = raw;
      try {
        fragment = decodeURIComponent(raw);
      } catch {
        // A malformed percent escape throws, and an exception inside an event
        // listener is a real failure mode — fall back to the raw fragment.
      }
      // Both operands go through the SAME normalizer, so a merchant's
      // "#Envío 4" and a visitor's "#envio-4" converge and match.
      if (safeAnchorId(fragment) !== anchor) return;
      // Only ever opens. Never sets `open` to false, so this can never fight
      // the merchant's "Expandido por defecto" toggle.
      el.open = true;
      // No arguments: instant, which is what native fragment navigation does,
      // and it honors the scroll-mt-24 cushion below.
      el.scrollIntoView();
    };

    openIfTargeted();
    window.addEventListener("hashchange", openIfTargeted);
    return () => window.removeEventListener("hashchange", openIfTargeted);
  }, [anchor]);

  return (
    <details
      ref={detailsRef}
      id={anchor}
      name="faq"
      open={isExpanded}
      // `<summary>` MUST stay a direct child of `<details>` for the native
      // disclosure toggle to work, so the open-state accent border can't live
      // on a wrapping descendant (that would require `group-open:`, which only
      // matches descendants of an open `.group`, never the group element
      // itself). Instead this uses Tailwind's `open:` variant, which targets
      // the element's OWN `[open]` attribute directly — no wrapper needed.
      className={cn(
        "group rounded-2xl border-2 border-transparent bg-card shadow-sm px-6 py-4 transition-colors open:border-brand-yellow",
        // Breathing room under whatever chrome the host page renders, applied
        // ONLY when anchored so an un-anchored item's class string is
        // byte-identical to before this field existed. (This theme has no
        // position: sticky anywhere, so it is a cushion, not a header offset.)
        anchor && "scroll-mt-24",
      )}
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

// Exactly 4 editable fields, ids → camelCase props. Spanish labels.
// Grow-only: `anchorId` is appended last and defaults to "", so an item saved
// before it existed keeps rendering exactly as it did.
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
  {
    id: "anchorId",
    label: "Ancla (enlace directo)",
    type: "text",
    default: "",
    info: "Escribe una palabra corta, por ejemplo q4. El enlace directo a esta pregunta será la dirección de tu página seguida de una almohadilla y esa palabra. Déjalo vacío si no lo necesitas.",
  },
];
