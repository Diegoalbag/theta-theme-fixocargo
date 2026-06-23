import * as React from "react";
import { Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconChip } from "@/components/ui/icon-chip";
import { SectionHeading } from "@/components/ui/section-heading";
import { EmptyState } from "@/lib/empty-state";
import { ImageGuard } from "@/lib/image-guard";

// Throwaway PRIVATE demo section (D-04/D-05) — the `_` prefix excludes it from
// `@theme` block expansion. This is the FULL convention sweep: it renders all
// four UI primitives (Button pill variant, Card surface + navy-dark,
// SectionHeading, IconChip), both src/lib/ render-guard helpers (EmptyState,
// ImageGuard), and accepts both shared @theme blocks (social-link +
// store-badge) via renderBlocks() — proving every Phase 1 convention is real
// before Phases 2-6 depend on them. Removed at the START of Phase 2 (not shipped).
export interface DemoProps {
  heading?: string;
  renderBlocks?: () => React.ReactNode;
}

export const Demo = ({ heading = "Demo", renderBlocks }: DemoProps) => {
  // CRITICAL: renderBlocks is a function prop. A `renderBlocks ? ... : ...`
  // ternary is ALWAYS truthy when present and never reaches the EmptyState.
  // Capture the rendered children once and branch on the COUNT so the
  // zero-blocks EmptyState placeholder deterministically renders.
  const children = renderBlocks?.();
  const hasBlocks = React.Children.count(children) > 0;

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

        {/* Accepts the shared @theme blocks (social-link + store-badge).
            Zero blocks -> EmptyState placeholder; one or more -> the blocks. */}
        {hasBlocks ? (
          <div className="flex flex-wrap items-center gap-4">{children}</div>
        ) : (
          <EmptyState />
        )}
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
