import * as React from "react";

import { EmptyState } from "@/lib/empty-state";

// Shared, environment-independent zero-blocks convention. EVERY Phase 2+ section
// that accepts child blocks must reuse this helper instead of re-deriving the
// guard — getting it wrong produces a blank gap in the customizer.
//
// `renderBlocks` arrives from the host in two distinct shapes:
//   1. Published page-renderer: `undefined` when the section has zero blocks,
//      a populated array (sortedBlocks.map(...)) when it has one or more.
//   2. Puck customizer: ALWAYS present when the section accepts blocks. It is a
//      custom in-iframe slot renderer (NOT a native Puck DropZone) that returns
//      a single `display:contents` wrapper element — `<div
//      style="display:contents">{items.map(...)}</div>` — called with no props.
//      `display:contents` generates no box, so at zero blocks `items` is `[]`
//      and the slot renders nothing with zero height: no native affordance.
//
// Why NOT branch on counting React children of the function-return: in the
// customizer the return is always one slot-wrapper element, so a count-based
// guard never reaches EmptyState AND cannot tell published-zero from
// customizer-zero. Branch only on the function-return value: `null`/empty-array
// == published-zero -> EmptyState; anything else (populated array OR the single
// customizer slot-wrapper) renders as-is.
//
// Because the customizer slot is a zero-height `display:contents` box, the as-is
// branch must supply its OWN visible affordance: an outer wrapper with a
// min-height floor, plus a dashed, token-only, aria-hidden "drop blocks here"
// placeholder layer beneath a relatively-positioned live slot. Real blocks paint
// over the placeholder when present; the customizer-zero case reveals it within
// the min-height floor. No state, no platform signal.
export interface BlocksSlotProps {
  renderBlocks?: () => React.ReactNode;
  empty?: React.ReactNode;
  className?: string;
}

export const BlocksSlot = ({
  renderBlocks,
  empty = <EmptyState />,
  className,
}: BlocksSlotProps): React.ReactNode => {
  const rendered = renderBlocks?.();
  const isPublishedZero =
    rendered == null || (Array.isArray(rendered) && rendered.length === 0);

  if (isPublishedZero) {
    return empty;
  }

  return (
    <div className="relative min-h-24">
      <div
        aria-hidden
        className="bg-secondary text-muted-foreground pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl border-2 border-dashed border-border text-sm"
      >
        Arrastra bloques aquí
      </div>
      <div className={`relative ${className ?? ""}`}>{rendered}</div>
    </div>
  );
};
