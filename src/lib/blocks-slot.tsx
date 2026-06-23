import * as React from "react";

import { EmptyState } from "@/lib/empty-state";

// Shared, environment-independent zero-blocks convention. EVERY Phase 2+ section
// that accepts child blocks must reuse this helper instead of re-deriving the
// guard — getting it wrong produces a blank gap in the customizer.
//
// `renderBlocks` arrives from the host in two distinct shapes:
//   1. Published page-renderer: `undefined` when the section has zero blocks,
//      a populated array (sortedBlocks.map(...)) when it has one or more.
//   2. Puck customizer: ALWAYS present when the section accepts blocks, and
//      ALWAYS returns ONE slot-wrapper element (Puck's own droppable empty-slot
//      affordance) regardless of block count.
//
// Why NOT React.Children.count(renderBlocks()): in the customizer the count is
// always 1 (the single slot-wrapper), so a count-based guard never reaches the
// EmptyState AND, worse, can't tell published-zero from customizer-zero. Branch
// only on the function-return value: `null`/empty-array == published-zero ->
// EmptyState; anything else (populated array OR the single slot-wrapper element)
// renders as-is, so the customizer always shows its working drop-zone and no
// path ever produces a blank gap.
export interface BlocksSlotProps {
  renderBlocks?: () => React.ReactNode;
  empty?: React.ReactNode;
  className?: string;
}

export const BlocksSlot = ({
  renderBlocks,
  empty,
  className,
}: BlocksSlotProps): React.ReactNode => {
  const rendered = renderBlocks?.();
  const isPublishedZero =
    rendered == null || (Array.isArray(rendered) && rendered.length === 0);

  if (isPublishedZero) {
    return empty ?? <EmptyState />;
  }

  return <div className={className}>{rendered}</div>;
};
