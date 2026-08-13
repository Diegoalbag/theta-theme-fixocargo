import * as React from "react";

// RateCard (RAT-01, D-11-03) — section-local block for the carga-aerea-rates
// grid, exclusive to that section (D-07 precedent: faq-item / service-card /
// process-step / partner-card / rate-row) and never registered in the global
// block maps.
//
// It implements D-11-03: the Carga Aérea routes render as CARDS, not as a
// 3-column numeric table. A three-column rate table does not survive mobile —
// it either overflows horizontally or collapses into unreadable stacked cells —
// whereas a card carries the same four values in natural reading order at every
// breakpoint.
//
// The italic AWB/THC breakdown sub-line is PLAIN JSX (an <em> around a text
// node), deliberately NOT routed through the theme's richtext sink. It carries
// no merchant HTML, so routing it through the sink would add a second HTML sink
// for no gain (C-11); as a plain text node React auto-escapes it (T-11-06).
//
// `h-full` on the card root is load-bearing: in the customizer the grid item is
// the per-block wrapper the host injects around each block, NOT the card itself,
// so without h-full the cards do not stretch to equal height there even though
// they look correct on the published site.
//
// Every field is guarded with `{field && …}` so a blank field renders nothing at
// all — never an empty element, an orphaned label or a stray separator. THE ROOT
// IS GUARDED TOO (WR-04): with every field blank the card drops its own chrome
// (padding, radius, background, shadow) rather than painting an empty panel, so
// the "renders nothing at all" invariant holds for the whole block and not just
// its fields. All five
// content defaults are empty: Carga Aérea route names and rate values are
// merchant-entered customizer content tracked in .planning/CONTENT-CHECKLIST.md,
// and hard-coding them would recreate exactly the stale-default problem CLN-02
// is cleaning up.
//
// No state, no event handlers, no hex literals, @/ imports only.
export interface RateCardProps {
  route?: string;
  perKg?: string;
  perKgNote?: string;
  localCharges?: string;
  breakdown?: string;
  blockId?: string;
  blockType?: string;
}

export const RateCard = ({
  route = "",
  perKg = "",
  perKgNote = "",
  localCharges = "",
  breakdown = "",
}: RateCardProps): React.ReactNode => {
  // WR-04: the card ROOT carries the visible chrome (p-8, rounded-2xl, bg-card,
  // shadow), so guarding only the fields still left a freshly added card
  // painting an empty padded panel. The root element is KEPT (never
  // `return null`): the empty-state matrix requires every block to emit
  // non-empty markup with blank props, and the customizer needs a node to
  // anchor its per-block wrapper to. Only the chrome is dropped, so a
  // contentless card draws nothing and occupies no grid space of its own.
  const hasContent = !!(
    route ||
    perKg ||
    perKgNote ||
    localCharges ||
    breakdown
  );

  return (
    <div
      className={
        hasContent
          ? "flex h-full flex-col items-start rounded-2xl bg-card p-8 shadow"
          : ""
      }
    >
      {route && (
        <h3 className="uppercase font-gotham font-bold text-xl text-brand-navy mb-3">
          {route}
        </h3>
      )}

      {(perKg || perKgNote) && (
        <p className="flex flex-wrap items-baseline gap-2">
          {perKg && (
            <span className="font-gotham font-bold text-brand-navy">
              {perKg}
            </span>
          )}
          {perKgNote && (
            <span className="font-opensans text-sm text-muted-foreground">
              {perKgNote}
            </span>
          )}
        </p>
      )}

      {localCharges && (
        <p className="mt-3 font-opensans text-base text-brand-navy">
          {localCharges}
        </p>
      )}

      {breakdown && (
        <em className="mt-1 font-opensans text-sm text-muted-foreground">
          {breakdown}
        </em>
      )}
    </div>
  );
};

// Exactly 5 editable fields, ids → camelCase props. Every default stays EMPTY on
// purpose — route names and tarifa values are merchant-entered customizer
// content tracked in .planning/CONTENT-CHECKLIST.md and must never be
// hard-coded. `perKgNote` is its own setting (rather than baked into `perKg`) so
// the merchant can clear the "mín. 100 kg" style qualifier independently.
export const rateCardSettingsSchema = [
  {
    id: "route",
    label: "Ruta",
    type: "text",
    default: "",
  },
  {
    id: "perKg",
    label: "Tarifa por kg",
    type: "text",
    default: "",
  },
  {
    id: "perKgNote",
    label: "Nota de la tarifa",
    type: "text",
    default: "",
  },
  {
    id: "localCharges",
    label: "Cargos locales",
    type: "text",
    default: "",
  },
  {
    id: "breakdown",
    label: "Desglose de cargos locales",
    type: "text",
    default: "",
  },
];
