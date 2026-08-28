import * as React from "react";
import { Search } from "lucide-react";

import { SectionHeading } from "@/components/ui/section-heading";
import { BlocksSlot } from "@/lib/blocks-slot";
import { safeHref } from "@/lib/safe-href";
import { safeAnchorId } from "@/lib/safe-anchor";
import { cn } from "@/lib/utils";

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
// DEEP LINKS (quick task 260828): an optional merchant-typed `anchorId` renders
// as the `id` on this <section>, so a nav link or CTA can target the whole band
// — the "Ver sucursales" CTA on Quiénes somos is exactly this case. Same guard
// (safeAnchorId) and same contract as the faq section: a blank value normalizes
// to `undefined`, which React drops entirely, so a sucursales section saved
// before this field existed renders byte-identically.
//
// The id goes on the OUTER <section> — the same node rootRef already points at.
// That is deliberate: an id is inert markup, so it cannot perturb the ref, the
// delegated click listener, or the filter's querySelector walk, all of which
// resolve by class/attribute rather than by id.
//
// No React state. Brand tokens only — no hex literals (the selected-card outline
// uses the --brand-yellow CSS var). @/ imports only.

// Stable, non-Tailwind marker on the branch-list layout div. The filter resolves
// the list at runtime with a querySelector off the section root (Hero does the
// same with its `.blaze-track` marker).
const BRANCH_LIST_CLASS = "fx-branch-list";

// Content-INDEPENDENT card marker emitted by every Branch block (WR-05). The
// filter enumerates and counts cards through this, never through
// `[data-branch-query]`: that attribute disappears when a merchant clears both
// name and mapQuery, which made such a card unfilterable AND broke the hide-
// target walk for its siblings by falsifying the "exactly one card" count.
// `[data-branch-query]` still marks the cards that are MAPPABLE (click target,
// default selection) — a different question from "is this a card".
const BRANCH_CARD_SELECTOR = "[data-branch-card]";

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
    parent.querySelectorAll(BRANCH_CARD_SELECTOR).length === 1
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

// The WeakMap doubles as the authoritative "is this hidden BY US" predicate:
// an entry exists from the moment we hide an element until we restore it.
const isFilteredOut = (el: HTMLElement): boolean => priorDisplay.has(el);

const MAPS_EMBED = (q: string) =>
  `https://maps.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
const MAPS_DIRECTIONS = (q: string) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}`;

export interface SucursalesProps {
  heading?: string;
  subtitle?: string;
  mapQuery?: string;
  anchorId?: string;
  renderBlocks?: () => React.ReactNode;
  sectionId?: string;
  sectionName?: string;
}

export const Sucursales = ({
  heading = "Nuestras Sucursales",
  subtitle = "Siempre cerca de ti: tu courier de confianza, estés donde estés",
  mapQuery = "República Dominicana",
  anchorId = "",
  renderBlocks,
}: SucursalesProps): React.ReactNode => {
  const anchor = safeAnchorId(anchorId);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);
  const mapRef = React.useRef<HTMLIFrameElement>(null);
  const contactRef = React.useRef<HTMLAnchorElement>(null);
  const directionsRef = React.useRef<HTMLAnchorElement>(null);
  const nameRef = React.useRef<HTMLSpanElement>(null);
  const addressRef = React.useRef<HTMLParagraphElement>(null);
  const selectedElRef = React.useRef<HTMLElement | null>(null);
  const lastSrcRef = React.useRef<string>("");
  const statusRef = React.useRef<HTMLParagraphElement>(null);
  const noResultsRef = React.useRef<HTMLParagraphElement>(null);

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
      // CR-02: `mapurl` is the merchant-editable `mapUrl` setting, written
      // IMPERATIVELY into a live href — no JSX-level handling applies, so a
      // `javascript:` value would execute in the page origin (in the customizer
      // that origin is the platform editor, not the merchant's own site). Route
      // it through the theme's shared scheme guard. safeHref returns "#" for an
      // empty OR blocked value; both degrade to the generated directions URL,
      // which is a live destination instead of the inert "#" the schema default
      // used to produce.
      const safe = safeHref(mapurl);
      directionsRef.current.href = safe === "#" ? MAPS_DIRECTIONS(q) : safe;
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
      let matched: number = 0;
      list
        .querySelectorAll<HTMLElement>(BRANCH_CARD_SELECTOR)
        .forEach((card) => {
          // Haystack = name + address only (horario is deliberately excluded).
          const haystack = fold(
            `${card.getAttribute("data-branch-name") ?? ""} ${
              card.getAttribute("data-branch-address") ?? ""
            }`,
          );
          const match = q === "" || haystack.includes(q);
          setHidden(resolveHideTarget(card, list), !match);
          if (match) {
            matched += 1;
            // Only a MAPPABLE card can be re-centered on: a card with neither
            // name nor mapQuery has no query for the embed.
            if (!first && card.hasAttribute("data-branch-query")) first = card;
          }
        });

      // WR-04: hiding cards with display:none correctly removes them from the
      // a11y tree, but nothing told a screen-reader user the result set had
      // changed, and a query matching NOTHING left an empty column with no
      // explanation while the map kept showing a branch that was no longer
      // listed. Both nodes are section-owned and updated imperatively — same
      // no-React-state pattern as the overlay's name/address.
      if (statusRef.current) {
        statusRef.current.textContent =
          q === ""
            ? ""
            : `${matched} ${
                matched === 1 ? "sucursal encontrada" : "sucursales encontradas"
              }`;
      }
      if (noResultsRef.current) {
        noResultsRef.current.hidden = q === "" || matched > 0;
      }

      // Re-center on the first surviving match only while a query is active:
      // clearing the box restores every card WITHOUT moving the map.
      //
      // WR-01: and only when the visitor's own selection did NOT survive the
      // query. The stated policy of this module (see the applyFilter header) is
      // that a pass must never yank the map off a branch the visitor
      // deliberately clicked; that protection was applied to the re-render path
      // but not to the typing path, where every keystroke was stealing a still-
      // matching selection — and rewriting iframe.src for each new first match.
      const sel = selectedElRef.current;
      const selSurvives =
        !!sel &&
        list.contains(sel) &&
        !isFilteredOut(resolveHideTarget(sel, list));
      if (recenter && q !== "" && first && !selSurvives) applyBranch(first);
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

    // WR-02: FILTER FIRST, then choose. Re-applying the active query to cards
    // added, removed, or reordered in the customizer used to run AFTER the
    // default selection, so the selection landed on the first branch in DOM
    // order regardless of the query — and the filter then hid that very card on
    // the next line, with recenter=false so nothing corrected it. The map ended
    // up showing a branch absent from the visible list, with the "selected"
    // outline painted on a hidden card.
    applyFilter(false);

    const sel = selectedElRef.current;
    if (sel && root.contains(sel)) return;

    const list = root.querySelector<HTMLElement>(`.${BRANCH_LIST_CLASS}`);
    const firstVisible = Array.from(
      root.querySelectorAll<HTMLElement>("[data-branch-query]"),
    ).find(
      (b) =>
        !list ||
        !list.contains(b) ||
        !isFilteredOut(resolveHideTarget(b, list)),
    );
    // When the query matches nothing there is deliberately NO fallback: leaving
    // the previous selection in place beats outlining a card nobody can see.
    if (firstVisible) applyBranch(firstVisible);
  });

  return (
    <section
      ref={rootRef}
      id={anchor}
      className={cn(
        "bg-transparent section-padding-y",
        // Cushion applied ONLY when anchored, so an un-anchored band's class
        // string is unchanged.
        anchor && "scroll-mt-24",
      )}
    >
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
                decorative and keeps aria-hidden.

                WR-03: because it is now TABBABLE it must show focus (WCAG
                2.4.7). Its old `outline-none` is gone rather than paired with a
                focus variant: Tailwind v4's outline-none sets
                --tw-outline-style: none at the base, which would silently
                neuter any focus-visible outline width. The replacement is the
                same brand focus ring NavLink and the Footer links use. */}
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
                className="flex-1 bg-transparent text-brand-navy placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-brand-yellow focus-visible:outline-offset-2"
              />
            </div>

            {/* LIST (not grid): one branch card per row. The marker class is the
                stable hook the filter's DOM walk scopes to (see
                BRANCH_LIST_CLASS) — layout classes stay Tailwind. */}
            <BlocksSlot
              renderBlocks={renderBlocks}
              className={`flex flex-col gap-4 ${BRANCH_LIST_CLASS}`}
            />

            {/* FILTER STATUS (WR-04). Two section-owned nodes that are ALWAYS
                in the DOM and written imperatively by applyFilter (no React
                state): an sr-only live region announcing the new result count,
                and a visible zero-results message. Both are inert in static
                markup — the live region is empty and the message ships the
                `hidden` ATTRIBUTE (never an inline display:none, which would
                trip the no-JS fallback assertion) — so with JS off the section
                renders exactly as before: every card, no stray message. */}
            <p ref={statusRef} role="status" aria-live="polite" className="sr-only" />
            <p
              ref={noResultsRef}
              hidden
              className="font-gill text-base text-brand-navy/80"
            >
              No encontramos sucursales que coincidan con tu búsqueda.
            </p>
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

// Four editable fields, ids → camelCase props. mapQuery seeds the map's initial
// (and no-JS) location before a branch is selected. Grow-only: `anchorId` is
// appended last and defaults to "".
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
  {
    id: "anchorId",
    label: "Ancla (enlace directo)",
    type: "text",
    default: "",
    info: "Escribe una palabra corta, por ejemplo sucursales. El enlace directo a esta sección será la dirección de tu página seguida de una almohadilla y esa palabra. Déjalo vacío si no lo necesitas.",
  },
];
