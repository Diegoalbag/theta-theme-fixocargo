import * as React from "react";
import { Search } from "lucide-react";

import { SectionHeading } from "@/components/ui/section-heading";
import { BlocksSlot } from "@/lib/blocks-slot";

// Sucursales (INF-01) — the light "find a branch" section. A light SectionHeading
// over a two-column row (stacked on mobile): LEFT = a REAL search input that
// filters the branch list + a vertical LIST BlocksSlot of section-local `branch`
// cards; RIGHT = a REAL, interactive Google Maps embed that re-centers on the
// branch you click, with a contact / directions overlay.
//
// Interactivity follows the Hero precedent (the ONE sanctioned exception): this
// uses `useRef` + `useEffect` + `useCallback` and NO `useState`. Render stays a
// pure function of props — the effects only enhance after mount:
//   • a single DELEGATED click listener on the stable section root reads the
//     clicked branch's `data-branch-*` attributes (emitted by the Branch block)
//     and imperatively swaps the iframe `src` + the overlay's contact/directions
//     hrefs. Delegation survives the customizer remounting the branch list.
//   • a per-render effect applies a default selection (first branch) whenever
//     nothing valid is selected (initial load + after add/remove edits).
//   • a LIVE FILTER: the search input's `input`/`search` events fold the typed
//     query (accent- + case-insensitive) and toggle each card's `style.display`
//     against the card's name + address attributes, then re-center the map on
//     the first still-matching branch. The input is UNCONTROLLED, so the DOM —
//     not React — holds the query, which is what keeps this state-free.
// jsdom/SSR never runs effects, so renderToStaticMarkup stays safe (matches Hero).
// The branch cards keep their own tel:/maps anchors as the no-JS fallback, and
// with JS off every card stays visible: nothing is hidden from JSX.
//
// No React state. Brand tokens only — no hex literals (the selected-card outline
// uses the --brand-yellow CSS var). @/ imports only.

// Stable, non-Tailwind marker on the branch-list layout div. The filter resolves
// the list at runtime with a querySelector off the section root (Hero does the
// same with its `.blaze-track` marker).
const BRANCH_LIST_CLASS = "fx-branch-list";

// Accent + case folding, module scope, pure, zero dependencies: NFD splits an
// accented character into base letter + combining mark, the combining-marks
// range is then stripped, so "independencia" matches "Av. Independéncia" in
// both directions.
const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

// Resolve the element that actually consumes the list's flex gap, which differs
// per context. Published: the card is a direct child of our layout div, so the
// card IS the hide target. In the customizer the host wraps EVERY block in its
// own wrapper element (and wraps the whole slot in a display:contents element),
// so hiding only the inner card would leave a phantom gap where the wrapper
// still sits. Climb outward while the parent is still inside the list, is not
// the list itself, and contains exactly ONE branch card.
//
// The `display: contents` stop (CR-01) is LOAD-BEARING, not defensive dressing.
// With a SINGLE branch the "exactly one card" test is also true of the host's
// slot wrapper, so without this guard the walk climbs past the per-block wrapper
// and returns the slot itself — an element the theme does not own and whose
// inline `display: contents` is the only thing keeping the blocks in OUR flex
// layout (see src/lib/blocks-slot.tsx). Never claim it as a hide target.
// Exported ONLY so the jsdom regression test can drive the real function
// against the real customizer tree shape (the section's effects themselves are
// unreachable under renderToStaticMarkup). Not part of the theme's registry
// surface — the platform never reads it.
export const resolveHideTarget = (
  card: HTMLElement,
  list: HTMLElement,
): HTMLElement => {
  let el: HTMLElement = card;
  let parent = el.parentElement;
  while (
    parent &&
    parent !== list &&
    list.contains(parent) &&
    parent.style.display !== "contents" &&
    parent.querySelectorAll("[data-branch-query]").length === 1
  ) {
    el = parent;
    parent = el.parentElement;
  }
  return el;
};

// Hide/show WITHOUT ever clobbering inline `display` the theme does not own
// (CR-01). `el.style.display = ""` is not "leave it alone" — it DELETES the
// declaration, so a blanket restore erases the host's `display: contents` (and
// any inline display the customizer sets on its per-block wrapper mid-drag).
// React never rewrites that value afterwards (it diffs prev === next and writes
// nothing), so the damage is permanent for the life of the page.
//
// Instead: record the element's ORIGINAL inline display the first time we hide
// it, restore exactly that value when it matches again, and — crucially — write
// NOTHING AT ALL for an element we never hid. That makes the matching path a
// true no-op, including the empty-query pass that runs on mount.
const priorDisplay = new WeakMap<HTMLElement, string>();

export const setHidden = (el: HTMLElement, hidden: boolean): void => {
  if (hidden) {
    // First touch only: a second hide pass must not record "none" as the
    // "original" value and thereby make the element permanently hidden.
    if (!priorDisplay.has(el)) priorDisplay.set(el, el.style.display);
    el.style.display = "none";
    return;
  }
  if (!priorDisplay.has(el)) return; // we never hid it → don't touch it.
  // Restore what was there before ("contents", "", …) — never a blind "".
  el.style.display = priorDisplay.get(el) as string;
  priorDisplay.delete(el);
};

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
  const searchRef = React.useRef<HTMLInputElement>(null);
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

  // Live filter over the branch cards. Reads the UNCONTROLLED input's value and
  // the cards' own data attributes straight from the DOM — no React state, so
  // this stays a post-mount enhancement over unchanged render output. `recenter`
  // is false for re-render-driven passes so a customizer edit can never yank the
  // map off the branch the visitor deliberately clicked.
  const applyFilter = React.useCallback(
    (recenter: boolean) => {
      const root = rootRef.current;
      const input = searchRef.current;
      if (!root || !input) return;
      const list = root.querySelector<HTMLElement>(`.${BRANCH_LIST_CLASS}`);
      if (!list) return;

      const q = fold(input.value.trim());
      let first: HTMLElement | null = null;
      list
        .querySelectorAll<HTMLElement>("[data-branch-query]")
        .forEach((card) => {
          // Haystack = name + address only (horario is deliberately excluded).
          const haystack = fold(
            `${card.getAttribute("data-branch-name") ?? ""} ${
              card.getAttribute("data-branch-address") ?? ""
            }`,
          );
          const match = q === "" || haystack.includes(q);
          setHidden(resolveHideTarget(card, list), !match);
          if (match && !first) first = card;
        });

      // Re-center on the first surviving match only while a query is active:
      // clearing the box restores every card WITHOUT moving the map.
      if (recenter && q !== "" && first) applyBranch(first);
    },
    [applyBranch],
  );

  // The search input is the section's OWN stable node — it never lives inside
  // the remounting blocks slot — so a direct listener is enough here; the
  // delegation the click effect below needs would buy nothing. `input` covers
  // every keystroke (no Enter required); `search` covers the native type=search
  // clear button.
  React.useEffect(() => {
    const input = searchRef.current;
    if (!input) return;
    const onInput = () => applyFilter(true);
    input.addEventListener("input", onInput);
    input.addEventListener("search", onInput);
    return () => {
      input.removeEventListener("input", onInput);
      input.removeEventListener("search", onInput);
    };
  }, [applyFilter]);

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
    // Re-apply the active query to cards added, removed, or reordered in the
    // customizer while the search box holds text (recenter=false — see above).
    applyFilter(false);
  });

  return (
    <section ref={rootRef} className="bg-transparent section-padding-y">
      <div className="container mx-auto container-padding-x">
        <SectionHeading variant="light" title={heading} subtitle={subtitle} />

        <div className="mt-8 flex flex-col-reverse gap-8 lg:flex-row">
          {/* LEFT — functional search + branch LIST slot. */}
          <div className="flex flex-col gap-4 lg:flex-1">
            {/* D-03 IS REVERSED FOR THIS ONE ELEMENT. This search used to be
                inert (readOnly / aria-hidden / tabIndex=-1, "decorative"); it is
                now a REAL, labelled, focusable control that drives the live
                branch filter (see applyFilter above). There is still NO React
                state: the input is UNCONTROLLED (no value/defaultValue), so the
                DOM holds the query across re-renders and the effect reads it
                imperatively. BlogHero's search input stays deliberately inert —
                it has no results surface to filter, so that is an intentional
                divergence, not an oversight. The magnifier ICON below stays
                decorative and keeps aria-hidden. */}
            <div className="flex items-center gap-2 rounded-lg bg-card border border-border px-5 h-[60px]">
              <Search
                aria-hidden="true"
                className="size-4 text-muted-foreground"
              />
              <input
                ref={searchRef}
                type="search"
                aria-label="Buscar sucursal por nombre o dirección"
                autoComplete="off"
                placeholder="Ingresa la ubicación"
                className="flex-1 bg-transparent outline-none text-brand-navy placeholder:text-muted-foreground"
              />
            </div>

            {/* LIST (not grid): one branch card per row. The marker class is the
                stable hook the filter's DOM walk scopes to (see
                BRANCH_LIST_CLASS) — layout classes stay Tailwind. */}
            <BlocksSlot
              renderBlocks={renderBlocks}
              className={`flex flex-col gap-4 ${BRANCH_LIST_CLASS}`}
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
