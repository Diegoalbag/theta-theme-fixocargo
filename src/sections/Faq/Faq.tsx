import * as React from "react";

import { BlocksSlot } from "@/lib/blocks-slot";
import { safeAnchorId } from "@/lib/safe-anchor";
import { cn } from "@/lib/utils";

// Faq — the "Preguntas frecuentes" Q&A band. A centered INLINE band header
// (yellow eyebrow + display-italic navy title) over a SINGLE, centered,
// max-width-constrained BlocksSlot stack of section-local `faq-item` accordion
// blocks. The default BlocksSlot EmptyState is KEPT (do NOT pass empty={null})
// so a zero-item section shows "Sin elementos" instead of a blank gap. Layout
// lives on the wrapper className only, never on the slot.
//
// The header is inline (NOT SectionHeading) because SectionHeading bakes a
// non-yellow eyebrow; this wants a font-aku italic title and a
// text-brand-yellow eyebrow.
//
// DEEP LINKS (260814-a07): an optional merchant-typed `anchorId` renders as the
// `id` on this <section>, so a nav link or CTA can target the whole band. It is
// deliberately guarded by the SAME safeAnchorId the faq-item block uses, and a
// blank value normalizes to `undefined`, which React drops entirely — so a faq
// section saved before this field existed renders byte-identically.
//
// NO effect here, on purpose. A <section> carrying an id is already a plain
// fragment target the browser scrolls to natively, and there is no disclosure
// widget to force open — the open-on-hash effect belongs to the faq-item block
// (which owns the <details> and already holds a ref to it). Adding a listener
// at this level would be duplicate machinery for zero behavior.
//
// No state, no event handlers, no hex literals, @/ imports only.
export interface FaqProps {
  eyebrow?: string;
  heading?: string;
  anchorId?: string;
  renderBlocks?: () => React.ReactNode;
  sectionId?: string;
  sectionName?: string;
}

export const Faq = ({
  eyebrow = "Preguntas frecuentes",
  heading = "Resolvemos tus dudas",
  anchorId = "",
  renderBlocks,
}: FaqProps): React.ReactNode => {
  const anchor = safeAnchorId(anchorId);

  return (
    <section
      id={anchor}
      className={cn(
        "bg-transparent section-padding-y",
        // Cushion applied ONLY when anchored, so an un-anchored band's class
        // string is unchanged.
        anchor && "scroll-mt-24",
      )}
    >
      <div className="container mx-auto container-padding-x">
        <div className="flex flex-col items-center text-center">
          {eyebrow && (
            <p className="font-gotham text-brand-yellow text-sm uppercase tracking-wide">
              {eyebrow}
            </p>
          )}
          {heading && (
            <h2 className="font-aku italic text-brand-navy text-3xl lg:text-5xl">
              {heading}
            </h2>
          )}
        </div>

        <BlocksSlot
          renderBlocks={renderBlocks}
          className="mx-auto mt-8 flex max-w-3xl flex-col gap-4"
        />
      </div>
    </section>
  );
};

// Exactly 3 editable fields, ids → camelCase props. Spanish defaults.
// Grow-only: `anchorId` is appended last and defaults to "".
export const faqSettingsSchema = [
  {
    id: "eyebrow",
    label: "Etiqueta superior",
    type: "text",
    default: "Preguntas frecuentes",
  },
  {
    id: "heading",
    label: "Título",
    type: "text",
    default: "Resolvemos tus dudas",
  },
  {
    id: "anchorId",
    label: "Ancla (enlace directo)",
    type: "text",
    default: "",
    info: "Escribe una palabra corta, por ejemplo faq. El enlace directo a esta sección será la dirección de tu página seguida de una almohadilla y esa palabra. Déjalo vacío si no lo necesitas.",
  },
];
