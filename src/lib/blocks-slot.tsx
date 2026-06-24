import * as React from "react";

import { EmptyState } from "@/lib/empty-state";

// Shared, environment-independent zero-blocks + layout convention. EVERY section
// that accepts child blocks reuses this instead of re-deriving the guard.
//
// `renderBlocks` arrives from the host in two shapes:
//   1. Published page-renderer: `undefined` when the section has zero blocks, or
//      a function returning an ARRAY of block elements when it has one or more.
//   2. Customizer: ALWAYS present. The host renders the block slot inside a
//      wrapper element carrying inline `display: contents` (so it generates no
//      box and its block children participate in the PARENT's layout).
//
// LAYOUT GOES ON A REAL WRAPPER, NEVER ON THE SLOT. The customizer slot's inline
// `display: contents` would override any `display` we set on it (collapsing the
// grid/flex and letting the blocks stack in the section). So we put `className`
// /`style` on our own <div> AROUND `renderBlocks()`: in the customizer the
// display:contents slot passes its block children up into THIS div's grid/flex;
// in the published renderer the returned array renders as our div's direct
// children. Both contexts lay the blocks out identically.
//
// Empty states: at published-zero we render `empty` (default <EmptyState/>, or
// `null` for chrome bars via empty={null}). In the customizer the host slot
// shows its own empty drop affordance, so we add nothing of our own.
export interface BlocksSlotProps {
  renderBlocks?: () => React.ReactNode;
  empty?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const BlocksSlot = ({
  renderBlocks,
  empty = <EmptyState />,
  className,
  style,
}: BlocksSlotProps): React.ReactNode => {
  const rendered = renderBlocks?.();

  // Published-zero: undefined (renderBlocks not provided) or an empty array.
  if (
    rendered == null ||
    (Array.isArray(rendered) && rendered.length === 0)
  ) {
    return empty;
  }

  // Layout box wrapping the slot (customizer) or the block array (published).
  // The blocks become its grid/flex children in BOTH contexts (see header).
  return (
    <div className={className ?? ""} style={style}>
      {rendered}
    </div>
  );
};
