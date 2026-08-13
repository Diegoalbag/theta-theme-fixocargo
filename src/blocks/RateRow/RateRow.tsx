import * as React from "react";

import { COURIER_TAB_OPTIONS, resolveCourierTab } from "@/lib/courier-tabs";

// RateRow (CUR-02, D-11-02) — section-local block for the courier-tabs rates
// list. A 2-column peso → tarifa row on the flat, single block slot that
// `courier-tabs` owns.
//
// It emits its OWN `data-courier-row` routing tag because a section can never
// inspect its child blocks' props in either render context (RESEARCH Pitfall 2):
// the customizer hands the section one opaque slot component while the published
// site hands it an array of renderer elements, so any JS-side partitioning would
// diverge between the two. The block is the only place that knows its own tag;
// the scoped `.courier-tabs` CSS block in src/index.css does the routing.
//
// The `tab` value passes through `resolveCourierTab` (T-11-01) — a curated
// 4-option select plus a membership check, so an arbitrary saved value can never
// reach the DOM verbatim and can never widen or escape the CSS attribute
// selector.
//
// The zero-gap block-flow row shape is deliberate (RESEARCH Pitfall 1): a hidden
// row must contribute exactly zero height even when its customizer wrapper
// (`<div style="position:relative">`, which the published site never emits)
// survives. Separators are drawn as `border-b` on the row itself, and there is
// deliberately NO `last:` variant stripping the trailing border — the customizer
// wraps every block in its own div so `last-child` matches every row there, and
// on the published site the last VISIBLE row is not the last DOM row once CSS
// partitioning hides some. A trailing hairline is the accepted outcome.
//
// No state, no event handlers, no hex literals, @/ imports only.
export interface RateRowProps {
  tab?: string;
  weight?: string;
  rate?: string;
  blockId?: string;
  blockType?: string;
}

export const RateRow = ({
  tab = "estados-unidos",
  weight = "",
  rate = "",
}: RateRowProps): React.ReactNode => {
  // Defensive default (T-11-01) — an unknown/arbitrary select value degrades to
  // the first courier panel and can never reach the DOM as an attacker-chosen
  // attribute value.
  const safeTab = resolveCourierTab(tab);

  return (
    <div
      data-courier-row={safeTab}
      className="flex items-center justify-between gap-4 border-b border-border py-3"
    >
      {weight && <span className="font-opensans text-brand-navy">{weight}</span>}

      {rate && (
        <span className="font-gotham font-bold text-brand-navy">{rate}</span>
      )}
    </div>
  );
};

// Exactly 3 editable fields, ids → camelCase props. Curated courier-tab enum;
// the select `value`s equal the COURIER_TABS keys. The weight/rate defaults stay
// EMPTY on purpose — tarifa values are merchant-entered customizer content
// tracked in .planning/CONTENT-CHECKLIST.md and must never be hard-coded.
export const rateRowSettingsSchema = [
  {
    id: "tab",
    label: "Panel",
    type: "select",
    default: "estados-unidos",
    options: [...COURIER_TAB_OPTIONS],
  },
  {
    id: "weight",
    label: "Peso",
    type: "text",
    default: "",
  },
  {
    id: "rate",
    label: "Tarifa",
    type: "text",
    default: "",
  },
];
