import * as React from "react";

import { BlocksSlot } from "@/lib/blocks-slot";

// ToolsBar (ATF-03) — compact above-the-fold band of quick-action pills.
// A responsive flex row (stack mobile → row desktop, wrapping beyond maxBlocks)
// wrapping a SINGLE BlocksSlot of section-local `tool-pill` blocks. All content
// lives on the blocks; the section has no editable settings (empty schema). The
// default BlocksSlot EmptyState is KEPT (do NOT pass empty={null}) so a zero-pill
// section shows the drop affordance instead of a blank gap (D-10).
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
    <section className="bg-background py-6 md:py-8">
      <div className="container mx-auto container-padding-x">
        <BlocksSlot
          renderBlocks={renderBlocks}
          className="flex flex-col gap-4 md:flex-row md:gap-6 md:flex-wrap"
        />
      </div>
    </section>
  );
};

// No section-level editable settings — all content lives on tool-pill blocks.
export const toolsBarSettingsSchema = [];
