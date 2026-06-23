import * as React from "react";
import { Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconChip } from "@/components/ui/icon-chip";
import { SectionHeading } from "@/components/ui/section-heading";
import { BlocksSlot } from "@/lib/blocks-slot";
import { ImageGuard } from "@/lib/image-guard";

// Throwaway PRIVATE demo section (D-04/D-05) — the `_` prefix excludes it from
// `@theme` block expansion. This is the FULL convention sweep: it renders all
// four UI primitives (Button pill variant, Card surface + navy-dark,
// SectionHeading, IconChip), the shared src/lib/ render-guard helpers
// (BlocksSlot for zero-blocks, ImageGuard for missing images), and accepts both
// shared @theme blocks (social-link + store-badge) via renderBlocks() — proving
// every Phase 1 convention is real before Phases 2-6 depend on them. Removed at
// the START of Phase 2 (not shipped).
export interface DemoProps {
  heading?: string;
  renderBlocks?: () => React.ReactNode;
}

export const Demo = ({ heading = "Demo", renderBlocks }: DemoProps) => {
  // Zero-blocks handling is delegated to the shared BlocksSlot convention
  // (src/lib/blocks-slot.tsx). It branches on the renderBlocks() return value
  // rather than counting React children of the function prop, so the customizer
  // slot and the published EmptyState both render correctly with no blank gap.
  return (
    <section aria-labelledby="demo-heading" className="section-padding-y">
      <div className="container-padding-x container mx-auto flex max-w-7xl flex-col gap-8">
        <SectionHeading
          eyebrow="Convención"
          title={heading}
          cta={
            <Button variant="pill" asChild>
              <a href="#">Buscar</a>
            </Button>
          }
        />
        {/* Tie the section's labelling id to the heading so aria-labelledby
            resolves to the SectionHeading title. */}
        <h2 id="demo-heading" className="sr-only">
          {heading}
        </h2>

        {/* Both Card variants — surface + navy-dark — so the navy path is proven */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card variant="surface" className="flex items-center gap-4">
            <IconChip background="yellow" aria-hidden>
              <Truck />
            </IconChip>
            <p className="font-opensans text-brand-navy">
              Tarjeta de superficie con un chip de ícono.
            </p>
          </Card>
          <Card variant="navy-dark" className="flex items-center gap-4">
            <IconChip background="surface" aria-hidden>
              <Truck />
            </IconChip>
            <p className="font-opensans">Tarjeta navy oscura.</p>
          </Card>
        </div>

        {/* ImageGuard with no url proves the missing-image placeholder renders
            (no crash, no blank gap). */}
        <ImageGuard url={undefined} />

        {/* Accepts the shared @theme blocks (social-link + store-badge) via the
            shared BlocksSlot convention: zero blocks -> EmptyState (published)
            or the working Puck slot (customizer); one or more -> the blocks. */}
        <BlocksSlot
          renderBlocks={renderBlocks}
          className="flex flex-wrap items-center gap-4"
        />
      </div>
    </section>
  );
};

export const demoSettingsSchema = [
  {
    id: "heading",
    label: "Título",
    type: "text",
    default: "Demo",
  },
];
