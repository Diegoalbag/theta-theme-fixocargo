import type React from "react";

// Throwaway PRIVATE demo section (D-04/D-05) — the `_` prefix excludes it from
// `@theme` block expansion. It exists only to keep `sectionsComponents`
// non-empty for the registration contract and to prove the shared blocks render
// via `renderBlocks()`. Removed at the START of Phase 2 (the full convention
// sweep — primitives + helpers — lands in Plan 03).
export interface DemoProps {
  heading?: string;
  renderBlocks?: () => React.ReactNode;
}

export const Demo = ({ heading = "Demo", renderBlocks }: DemoProps) => {
  return (
    <section aria-labelledby="demo-heading" className="section-padding-y">
      <div className="container-padding-x container mx-auto flex max-w-7xl flex-col gap-8">
        <h2 id="demo-heading" className="heading-lg text-brand-navy">
          {heading}
        </h2>
        {/* Accepts the shared @theme blocks (social-link + store-badge) */}
        {renderBlocks && (
          <div className="flex flex-wrap items-center gap-4">
            {renderBlocks()}
          </div>
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
