// Shared courier tab keys (D-11-02) — the SINGLE source of truth for the four
// fixed courier panels. This module exists specifically so the `rate-row` block
// never imports from `src/sections/`: the project's Anti-Patterns section
// forbids importing sections and blocks into each other, and both
// `RateRow` (which emits the routing tag) and `CourierTabs` (which renders the
// panels) need the exact same key tuple. Both import it from here.
//
// `resolveCourierTab` is the SECURITY BOUNDARY for the merchant-supplied `tab`
// value (threat T-11-01). The value is written into a `data-courier-row`
// attribute that a CSS attribute selector matches on, so an arbitrary saved
// value must never reach the DOM verbatim — it is membership-checked against
// COURIER_TABS and degrades to the first tab otherwise. Same defensive shape as
// ValueCard's `iconMap[icon] ?? ShieldCheck`.
export const COURIER_TABS = [
  "estados-unidos",
  "europa",
  "china",
  "exportacion",
] as const;

export type CourierTabKey = (typeof COURIER_TABS)[number];

// Curated `select` options for the rate-row `tab` setting. Values equal the
// COURIER_TABS keys, in the same order; labels are the Spanish panel names.
export const COURIER_TAB_OPTIONS: ReadonlyArray<{
  value: CourierTabKey;
  label: string;
}> = [
  { value: "estados-unidos", label: "Estados Unidos" },
  { value: "europa", label: "Europa" },
  { value: "china", label: "China" },
  { value: "exportacion", label: "Exportación a EE.UU." },
];

export const resolveCourierTab = (value?: string): CourierTabKey =>
  (COURIER_TABS as readonly string[]).includes(value ?? "")
    ? (value as CourierTabKey)
    : "estados-unidos";
