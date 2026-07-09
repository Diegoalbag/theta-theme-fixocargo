import * as React from "react";

import { BlocksSlot } from "@/lib/blocks-slot";

// DireccionCards (ATF-02) — compact band of receiving-address cards.
// A responsive grid (1-up mobile → 2-up desktop) wrapping a SINGLE BlocksSlot
// of section-local `address-card` blocks. All content lives on the blocks; the
// section has no editable settings (empty schema). The default BlocksSlot
// EmptyState is KEPT (do NOT pass empty={null}) so a zero-card section shows the
// drop affordance instead of a blank gap (D-10).
//
// No state, no event handlers, no hex literals, @/ imports only.
export interface DireccionCardsProps {
  renderBlocks?: () => React.ReactNode;
  sectionId?: string;
  sectionName?: string;
}

export const DireccionCards = ({
  renderBlocks,
}: DireccionCardsProps): React.ReactNode => {
  return (
    <section className="bg-transparent section-padding-y pb-10">
      <div className="container mx-auto container-padding-x">
        <BlocksSlot
          renderBlocks={renderBlocks}
          className="grid grid-cols-1 gap-6 md:grid-cols-2"
        />
      </div>
    </section>
  );
};

// No section-level editable settings — all content lives on address-card blocks.
export const direccionCardsSettingsSchema = [];
