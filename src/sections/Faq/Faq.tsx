import * as React from "react";

import { BlocksSlot } from "@/lib/blocks-slot";

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
// No state, no event handlers, no hex literals, @/ imports only.
export interface FaqProps {
  eyebrow?: string;
  heading?: string;
  renderBlocks?: () => React.ReactNode;
  sectionId?: string;
  sectionName?: string;
}

export const Faq = ({
  eyebrow = "Preguntas frecuentes",
  heading = "Resolvemos tus dudas",
  renderBlocks,
}: FaqProps): React.ReactNode => {
  return (
    <section className="bg-transparent section-padding-y">
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

// Exactly 2 editable fields, ids → camelCase props. Spanish defaults.
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
];
