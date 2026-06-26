import * as React from "react";
import { Search } from "lucide-react";

import { SectionHeading } from "@/components/ui/section-heading";
import { BlocksSlot } from "@/lib/blocks-slot";

// Sucursales (INF-01) — the light "find a branch" section. A light SectionHeading
// over a two-column row (stacked on mobile): LEFT = a decorative search input +
// a vertical LIST BlocksSlot of section-local `branch` cards; RIGHT = a REAL,
// interactive Google Maps embed that re-centers on the branch you click, with a
// contact / directions overlay.
//
// Interactivity follows the Hero precedent (the ONE sanctioned exception): this
// uses `useRef` + `useEffect` and NO `useState`. Render stays a pure function of
// props — the effect only enhances after mount:
//   • a single DELEGATED click listener on the stable section root reads the
//     clicked branch's `data-branch-*` attributes (emitted by the Branch block)
//     and imperatively swaps the iframe `src` + the overlay's contact/directions
//     hrefs. Delegation survives the customizer remounting the branch list.
//   • a per-render effect applies a default selection (first branch) whenever
//     nothing valid is selected (initial load + after add/remove edits).
// jsdom/SSR never runs effects, so renderToStaticMarkup stays safe (matches Hero).
// The branch cards keep their own tel:/maps anchors as the no-JS fallback.
//
// No React state. Brand tokens only — no hex literals (the selected-card outline
// uses the --brand-yellow CSS var). @/ imports only.
const MAPS_EMBED = (q: string) =>
  `https://maps.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
const MAPS_DIRECTIONS = (q: string) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}`;

export interface SucursalesProps {
  heading?: string;
  subtitle?: string;
  mapQuery?: string;
  renderBlocks?: () => React.ReactNode;
  sectionId?: string;
  sectionName?: string;
}

export const Sucursales = ({
  heading = "Nuestras Sucursales",
  subtitle = "Siempre cerca de ti: tu courier de confianza, estés donde estés",
  mapQuery = "República Dominicana",
  renderBlocks,
}: SucursalesProps): React.ReactNode => {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<HTMLIFrameElement>(null);
  const contactRef = React.useRef<HTMLAnchorElement>(null);
  const directionsRef = React.useRef<HTMLAnchorElement>(null);
  const nameRef = React.useRef<HTMLSpanElement>(null);
  const addressRef = React.useRef<HTMLParagraphElement>(null);
  const selectedElRef = React.useRef<HTMLElement | null>(null);
  const lastSrcRef = React.useRef<string>("");

  // Point the map + overlay at one branch. Reads only refs + the passed element,
  // so it is a stable closure that is safe to reuse across renders.
  const applyBranch = React.useCallback((el: HTMLElement) => {
    const q = el.getAttribute("data-branch-query");
    if (!q) return;
    const name = el.getAttribute("data-branch-name") ?? "";
    const phone = el.getAttribute("data-branch-phone") ?? "";
    const mapurl = el.getAttribute("data-branch-mapurl") ?? "";
    const address = el.getAttribute("data-branch-address") ?? "";

    const src = MAPS_EMBED(q);
    if (mapRef.current && lastSrcRef.current !== src) {
      mapRef.current.src = src;
      lastSrcRef.current = src;
    }
    if (directionsRef.current) {
      directionsRef.current.href = mapurl || MAPS_DIRECTIONS(q);
    }
    if (contactRef.current) {
      if (phone) {
        contactRef.current.href = `tel:${phone}`;
        contactRef.current.style.display = "";
      } else {
        contactRef.current.removeAttribute("href");
        contactRef.current.style.display = "none";
      }
    }
    if (nameRef.current) nameRef.current.textContent = name;
    if (addressRef.current) addressRef.current.textContent = address;

    // Move the selected-card outline (CSS var → no hex literal).
    const prev = selectedElRef.current;
    if (prev && prev !== el) {
      prev.style.outline = "";
      prev.style.outlineOffset = "";
    }
    el.style.outline = "2px solid var(--brand-yellow)";
    el.style.outlineOffset = "2px";
    selectedElRef.current = el;
  }, []);

  // Delegated click listener on the stable section root (survives the customizer
  // remounting the branch list). Attached once.
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const el = target?.closest<HTMLElement>("[data-branch-query]");
      if (el && root.contains(el)) applyBranch(el);
    };
    // Capture phase: fires top-down before the customizer (Puck) can stop the
    // click's propagation for its own block-selection handling.
    root.addEventListener("click", onClick, true);
    return () => root.removeEventListener("click", onClick, true);
  }, [applyBranch]);

  // Default selection: after every render, if nothing valid is selected, point
  // the map at the first branch (initial load + after add/remove edits).
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const branches = root.querySelectorAll<HTMLElement>("[data-branch-query]");
    if (branches.length === 0) return;
    const sel = selectedElRef.current;
    if (!sel || !root.contains(sel)) applyBranch(branches[0]);
  });

  return (
    <section ref={rootRef} className="bg-background section-padding-y">
      <div className="container mx-auto container-padding-x">
        <SectionHeading variant="light" title={heading} subtitle={subtitle} />

        <div className="mt-8 flex flex-col-reverse gap-8 lg:flex-row">
          {/* LEFT — decorative search + branch LIST slot. */}
          <div className="flex flex-col gap-4 lg:flex-1">
            {/* Decorative search (D-03): inert, no state, no handlers. */}
            <div className="flex items-center gap-2 rounded-lg bg-card border border-border px-5 h-[60px]">
              <Search
                aria-hidden="true"
                className="size-4 text-muted-foreground"
              />
              <input
                type="text"
                readOnly
                aria-hidden="true"
                tabIndex={-1}
                placeholder="Ingresa la ubicación"
                className="flex-1 bg-transparent outline-none text-muted-foreground"
              />
            </div>

            {/* LIST (not grid): one branch card per row. */}
            <BlocksSlot
              renderBlocks={renderBlocks}
              className="flex flex-col gap-4"
            />
          </div>

          {/* RIGHT — real interactive map + contact/directions overlay. */}
          <div className="relative space-y-3 min-h w-full overflow-hidden rounded-2xl lg:flex-1">
            <iframe
              ref={mapRef}
              title="Mapa de sucursales"
              src={MAPS_EMBED(mapQuery || "República Dominicana")}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full min-h-[300px] w-full border-0"
            />
            {/* Selected-branch overlay panel (translucent navy card on the map).
                name/address + button hrefs are set imperatively per selection
                (see applyBranch). The wrapper is pointer-events-none so the map
                stays interactive around the panel; the panel re-enables events.
                Contact hides until a branch with a phone is selected. */}
            {/*<div className="pointer-events-none absolute inset-0 flex items-end justify-center p-4 sm:items-center sm:justify-start sm:p-8">*/}
            <div className="pointer-events-auto mx-auto md:absolute md:top-10 md:left-1/2 md:-translate-x-1/2 inset-0 w-full max-w-sm max-h-min rounded-3xl bg-brand-navy/70 p-6 text-white backdrop-blur-sm">
              <span
                ref={nameRef}
                className="block font-gotham text-lg font-bold leading-6"
              >
                Selecciona una sucursal
              </span>
              <p
                ref={addressRef}
                className="mt-3 font-gill text-sm leading-5 text-white/90"
              />
              <div className="mt-5 flex flex-col gap-3">
                <a
                  ref={contactRef}
                  href="#"
                  style={{ display: "none" }}
                  className="flex h-12 items-center justify-center rounded-lg bg-card font-gotham font-bold text-brand-navy"
                >
                  Contáctanos
                </a>
                <a
                  ref={directionsRef}
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 items-center justify-center rounded-lg bg-card font-gotham font-bold text-brand-navy"
                >
                  Dirección
                </a>
              </div>
            </div>
            {/*</div>*/}
          </div>
        </div>
      </div>
    </section>
  );
};

// Three editable fields, ids → camelCase props. mapQuery seeds the map's initial
// (and no-JS) location before a branch is selected.
export const sucursalesSettingsSchema = [
  {
    id: "heading",
    label: "Encabezado",
    type: "text",
    default: "Nuestras Sucursales",
  },
  {
    id: "subtitle",
    label: "Subtítulo",
    type: "text",
    default: "Siempre cerca de ti: tu courier de confianza, estés donde estés",
  },
  {
    id: "mapQuery",
    label: "Ubicación inicial del mapa",
    type: "text",
    default: "República Dominicana",
    info: "Dirección o coordenadas que muestra el mapa antes de elegir una sucursal.",
  },
];
