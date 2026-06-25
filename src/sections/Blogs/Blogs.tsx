import * as React from "react";

import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { BlocksSlot } from "@/lib/blocks-slot";

// Blogs (INF-03) — the light "Últimos Blogs" band. A light SectionHeading
// (navy H2 + eyebrow subtitle) with a real navy section CTA anchor, over a
// responsive 1→3-up grid wrapping a SINGLE BlocksSlot of section-local
// `blog-card` blocks. The default BlocksSlot EmptyState is KEPT (do NOT pass
// empty={null}) so a zero-card section shows the drop affordance (D-08). Layout
// lives on the wrapper className only, never on the slot.
//
// No state, no event handlers, no hex literals, @/ imports only.
export interface BlogsProps {
  heading?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  renderBlocks?: () => React.ReactNode;
  sectionId?: string;
  sectionName?: string;
}

export const Blogs = ({
  heading = "Últimos Blogs",
  subtitle = "Novedades, tendencias y más",
  ctaLabel = "Explora todos blogs",
  ctaUrl = "#",
  renderBlocks,
}: BlogsProps): React.ReactNode => {
  return (
    <section className="bg-background section-padding-y">
      <div className="container mx-auto container-padding-x">
        <SectionHeading
          variant="light"
          title={heading}
          eyebrow={subtitle}
          cta={
            <Button variant="navy" asChild>
              <a href={ctaUrl || "#"}>{ctaLabel}</a>
            </Button>
          }
        />

        <BlocksSlot
          renderBlocks={renderBlocks}
          className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        />
      </div>
    </section>
  );
};

// Exactly 4 editable fields, ids → camelCase props.
export const blogsSettingsSchema = [
  {
    id: "heading",
    label: "Encabezado",
    type: "text",
    default: "Últimos Blogs",
  },
  {
    id: "subtitle",
    label: "Subtítulo",
    type: "text",
    default: "Novedades, tendencias y más",
  },
  {
    id: "ctaLabel",
    label: "Texto del botón",
    type: "text",
    default: "Explora todos blogs",
  },
  {
    id: "ctaUrl",
    label: "Enlace del botón",
    type: "url",
    default: "#",
    placeholder: "https://…",
  },
];
