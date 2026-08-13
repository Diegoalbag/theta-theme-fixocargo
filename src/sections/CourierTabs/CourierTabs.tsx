import * as React from "react";

import { BlocksSlot } from "@/lib/blocks-slot";
import { RichText } from "@/lib/rich-text";
import { COURIER_TABS } from "@/lib/courier-tabs";

// CourierTabs (CUR-01/02/03, D-11-02, D-11-04, D-11-05) — the FixoCargo courier
// band: four fixed destination panels over one flat list of `rate-row` blocks.
//
// The `courier-tabs` root class is LOAD-BEARING, not decorative: it is the
// anchor for the scoped `:has()` rule block at the end of src/index.css, which
// is what actually shows and hides panels and rows. Renaming it silently breaks
// tab switching.
//
// The section owns FOUR fixed panels (D-11-04: exactly ONE richtext body each)
// and EXACTLY ONE block slot. A section can never inspect its child blocks'
// props — the customizer hands it a single opaque slot component while the
// published site hands it an array of renderer elements — so `rate-row` tags
// ITSELF with `data-courier-row` and CSS does the routing. Never render the
// block slot twice, and never inspect what `renderBlocks()` returns.
//
// The rates container is deliberately zero-gap block flow (no grid, no `gap`):
// a hidden row's customizer wrapper then contributes exactly zero height even if
// the wrapper-collapse selector misses, so the list degrades gracefully instead
// of showing phantom gaps.
//
// D-11-05: a tab with zero matching `rate-row` blocks shows an EMPTY rates
// region. This is accepted for v1 — the slot's EmptyState only fires at global
// zero, and per-tab empty hints were explicitly deferred.
//
// All interaction state is native DOM state (radio `:checked`): no React state,
// no event handlers, no hex literals, @/ imports only.
export interface CourierTabsProps {
  eyebrow?: string;
  heading?: string;
  tab1Label?: string;
  tab1Body?: string;
  tab2Label?: string;
  tab2Body?: string;
  tab3Label?: string;
  tab3Body?: string;
  tab4Label?: string;
  tab4Body?: string;
  renderBlocks?: () => React.ReactNode;
  sectionId?: string;
  sectionName?: string;
}

export const CourierTabs = ({
  eyebrow = "Courier",
  heading = "Envíos internacionales",
  tab1Label = "Estados Unidos",
  tab1Body = "",
  tab2Label = "Europa",
  tab2Body = "",
  tab3Label = "China",
  tab3Body = "",
  tab4Label = "Exportación a EE.UU.",
  tab4Body = "",
  renderBlocks,
}: CourierTabsProps): React.ReactNode => {
  // Stable, unique, SSR-safe id scoping the radio group to THIS instance.
  // useId is NOT React state — it is allowed under the stateless contract. A
  // constant `name` would make two courier-tabs sections on one page share a
  // radio group, so clicking a tab in one would blank the other.
  const uid = React.useId();

  const panels = [
    { key: COURIER_TABS[0], label: tab1Label, body: tab1Body },
    { key: COURIER_TABS[1], label: tab2Label, body: tab2Body },
    { key: COURIER_TABS[2], label: tab3Label, body: tab3Body },
    { key: COURIER_TABS[3], label: tab4Label, body: tab4Body },
  ];

  return (
    <section className="courier-tabs bg-transparent section-padding-y">
      <div className="container mx-auto container-padding-x">
        <div className="flex flex-col items-start gap-3">
          {eyebrow && (
            <p className="font-gotham text-brand-yellow text-sm uppercase tracking-wide">
              {eyebrow}
            </p>
          )}
          {heading && (
            <h2 className="font-aku italic text-brand-navy text-3xl lg:text-5xl">
              {heading}
            </h2>
          )}
        </div>

        {/* Each radio sits immediately before its own label so the scoped CSS can
            style the active/focused pill with a plain `+` combinator. sr-only
            (never `hidden`) keeps the input in the focus order, which is what
            gives the tab strip its free arrow-key keyboard contract.
            defaultChecked, never checked — an uncontrolled input is stateless. */}
        <div
          role="radiogroup"
          aria-label="Destino"
          className="mt-8 flex flex-wrap gap-2"
        >
          {panels.map((panel, index) => (
            <React.Fragment key={panel.key}>
              <input
                type="radio"
                name={`courier-tabs-${uid}`}
                id={`${uid}-${panel.key}`}
                data-courier-input={panel.key}
                defaultChecked={index === 0}
                className="sr-only"
              />
              <label
                htmlFor={`${uid}-${panel.key}`}
                className="cursor-pointer select-none rounded-full border border-border px-5 py-2 font-gotham text-sm text-brand-navy transition-colors"
              >
                {panel.label}
              </label>
            </React.Fragment>
          ))}
        </div>

        {panels.map((panel) => (
          <div
            key={panel.key}
            data-courier-panel={panel.key}
            role="region"
            aria-label={panel.label}
            className="mt-6"
          >
            {/* Guarded: a blank body renders NOTHING. Unguarded, the sink would
                emit its "Sin contenido" EmptyState in all four panels and the
                visible one would read like an error. RichText is the theme's
                ONLY sanitizing sink. */}
            {panel.body && <RichText html={panel.body} />}
          </div>
        ))}

        {/* ONE slot for ALL rate-rows, zero-gap block flow (see header). The
            default EmptyState is KEPT (never empty={null} — that is chrome
            only) so a zero-row section shows "Sin elementos", not a blank gap. */}
        <BlocksSlot renderBlocks={renderBlocks} className="courier-rates mt-8" />
      </div>
    </section>
  );
};

// Exactly 10 editable fields, ids → camelCase props. Four fixed label/body pairs
// positionally mapped to the COURIER_TABS order; every body is richtext and
// defaults EMPTY — all courier copy is merchant-entered customizer content
// tracked in .planning/CONTENT-CHECKLIST.md.
export const courierTabsSettingsSchema = [
  {
    id: "eyebrow",
    label: "Etiqueta superior",
    type: "text",
    default: "Courier",
  },
  {
    id: "heading",
    label: "Título",
    type: "text",
    default: "Envíos internacionales",
  },
  {
    id: "tab1Label",
    label: "Panel 1 — Título",
    type: "text",
    default: "Estados Unidos",
  },
  {
    id: "tab1Body",
    label: "Panel 1 — Contenido",
    type: "richtext",
    default: "",
  },
  {
    id: "tab2Label",
    label: "Panel 2 — Título",
    type: "text",
    default: "Europa",
  },
  {
    id: "tab2Body",
    label: "Panel 2 — Contenido",
    type: "richtext",
    default: "",
  },
  {
    id: "tab3Label",
    label: "Panel 3 — Título",
    type: "text",
    default: "China",
  },
  {
    id: "tab3Body",
    label: "Panel 3 — Contenido",
    type: "richtext",
    default: "",
  },
  {
    id: "tab4Label",
    label: "Panel 4 — Título",
    type: "text",
    default: "Exportación a EE.UU.",
  },
  {
    id: "tab4Body",
    label: "Panel 4 — Contenido",
    type: "richtext",
    default: "",
  },
];
