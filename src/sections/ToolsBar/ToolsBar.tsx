import * as React from "react";

import { BlocksSlot } from "@/lib/blocks-slot";

// ToolsBar (ATF-03) — compact above-the-fold band of quick-action pills.
// A SINGLE BlocksSlot of section-local `tool-pill` blocks: stacked 1-up on
// mobile, and on desktop an equal-width row (grid-flow-col + auto-cols-fr) so
// every pill occupies the same width and fills the band. The layout class is
// applied to the slot itself, so the pills are its direct grid children. All
// content lives on the blocks; the section has no editable settings (empty
// schema). The default BlocksSlot EmptyState is KEPT (do NOT pass empty={null})
// so a zero-pill section shows the drop affordance instead of a blank gap (D-10).
//
// No state, no event handlers, no hex literals, @/ imports only.
export interface ToolsBarProps {
  renderBlocks?: () => React.ReactNode;
  sectionId?: string;
  sectionName?: string;
}

export const ToolsBar = ({
  renderBlocks,
}: ToolsBarProps): React.ReactNode => {
  return (
    <section className="bg-background py-6 md:py-10">
      <div className="container mx-auto container-padding-x">
        <BlocksSlot
          renderBlocks={renderBlocks}
          className="grid grid-cols-1 gap-4 md:grid-cols-none md:auto-cols-fr md:grid-flow-col md:gap-6"
        />
      </div>
    </section>
  );
};

// No section-level editable settings — all content lives on tool-pill blocks.
export const toolsBarSettingsSchema = [];
