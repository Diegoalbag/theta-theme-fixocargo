import * as React from "react";
import { ChevronDown } from "lucide-react";

import { safeHref } from "@/lib/safe-href";

// NavLink — section-local block for SiteHeader navigation items.
//
// TWO BRANCHES, ONE STATELESS COMPONENT:
//   * no child label filled  -> a bare anchor, exactly as this block has always
//     rendered. Every already-saved nav-link keeps this output byte for byte.
//   * at least one child label filled -> a native details/summary disclosure
//     holding the parent's own destination (when `url` is set to something
//     other than the `#` default) followed by the filled child links.
//
// THE PARENT `url` IS NEVER DISCARDED (CR-02). A <summary> only toggles the
// disclosure — it does not navigate — so the disclosure branch renders the
// parent destination as the FIRST entry of the panel. Without it the saved
// "Enlace URL" value would be orphaned and a nav item that used to navigate
// would silently stop, with no other route to it on desktop or mobile.
//
// The disclosure has NO React state and NO event handler in the markup. The
// native element still owns the open state, and summary is natively focusable,
// toggles on Enter/Space, and carries an implicit button role plus a real
// aria-expanded — correct semantics with zero scripted ARIA. What it now also
// carries is ONE guarded effect (below), which only ever sets `open` to false:
// the native summary toggle keeps sole ownership of OPENING. Branch A
// subscribes to nothing at all, because it never attaches the ref, so the
// effect's `if (!el) return` guard — not the branch itself — is the mechanism.
//
// The effect resolves its own <details>, <summary> and panel BY REF and tests
// membership with `el.contains(target)`. That is load-bearing, not stylistic:
// with no lookup there is no selector for a merchant string to be interpolated
// into (the CR-02 scar from quick task 260813-fe3) and nothing walks outward
// from the block root into the customizer's injected wrapper (CR-01). Same
// shape FaqItem's effect uses.
//
// ONE MARKUP, TWO LAYOUTS: the panel is an inline accordion by default (inside
// SiteHeader's mobile hamburger panel) and becomes a dropdown on lg: via
// responsive utilities alone — no duplicated markup, no breakpoint branch.
//
// REVISES D-06 (per NAV-01 / D-11-01). D-06 declared the caret decorative with
// no dropdown and no submenu behavior; that is now true ONLY in the bare-anchor
// branch. In the disclosure branch the caret is unconditional and reflects real
// submenu state, rotating with the open state.
//
// Child slots are a FIXED count of 8 (7 services + 1 spare) with blank labels
// filtered out — the FooterColumn fixed-slot precedent (D-05). "Blank" means
// whitespace-trimmed-empty, not just empty string (WR-07): this filter selects
// the BRANCH, so a stray space in child1Label would otherwise convert a saved
// plain anchor into a disclosure with a blank focusable entry. Provisioning is
// grow-only: adding a slot later is additive, removing one orphans saved values.
//
// No exclusivity-forcing attribute is set on the disclosure. FaqItem documents
// the caveat: a constant group attribute makes every instance on the page
// mutually exclusive, which is deliberately not wanted here.
//
// TARGET SIZE (WR-05): SiteHeader's block slot applies `[&_a]:py-1
// lg:[&_a]:py-0` to every descendant anchor, so at lg: these panel links would
// inherit py-0 and collapse to a ~20px text-sm hit target, under the 24x24 CSS-px
// floor of WCAG 2.5.8 — `lg:gap-2` (8px) does not close that. Each panel anchor
// therefore carries `flex min-h-6 items-center`, which sets its own floor
// regardless of the inherited padding override. Same bar the project already
// applied to the Blaze pagination dots in src/index.css.
//
// DISMISSAL (quick task 260814-f97). The panel now closes on a pointerdown
// outside the disclosure, on Escape, and on a click inside the panel itself
// (every interactive thing in there is a link, and an in-page #fragment link no
// longer navigates away, so it would otherwise hang open over the destination).
// This REVERSES the stance phase 11 recorded deliberately in 11-04, which
// accepted "no Escape-to-dismiss and no click-outside-to-close" as a permanent
// CSS-only limit; the phase-11 records carry dated notes pointing here. The
// WCAG 1.4.13 reasoning quoted alongside that stance was never its cause — that
// criterion governs HOVER-triggered content and a click/Enter disclosure is not
// hover-triggered, so it is unaffected either way.
//
// A second nav item's summary click also closes the first, since that press
// lands outside the first disclosure. That free mutual exclusivity is wanted
// here (unlike FaqItem, which declines it) and is not a bug.
//
// All content arrives as props from the platform. Anchors render href only —
// no link-target attribute anywhere, so no submenu link ever opens a new
// browsing context and reverse tabnabbing has no surface (T-11-08).
//
// EVERY href here routes through `safeHref` (WR-06 / T-11-09). This block owns
// up to 9 merchant-controlled link sinks per nav item (parent + 8 children), and
// site-header allows 8 nav items — 72 sinks. `safeHref` denies javascript: /
// vbscript: / data: schemes and degrades them to `#`; everything else passes
// through byte-for-byte, so Branch A output is unchanged for every safe value.
export interface NavLinkProps {
  label?: string;
  url?: string;
  hasCaret?: boolean;
  child1Label?: string;
  child1Url?: string;
  child2Label?: string;
  child2Url?: string;
  child3Label?: string;
  child3Url?: string;
  child4Label?: string;
  child4Url?: string;
  child5Label?: string;
  child5Url?: string;
  child6Label?: string;
  child6Url?: string;
  child7Label?: string;
  child7Url?: string;
  child8Label?: string;
  child8Url?: string;
  blockId?: string;
  blockType?: string;
}

export const NavLink = ({
  label,
  url,
  hasCaret = false,
  child1Label,
  child1Url,
  child2Label,
  child2Url,
  child3Label,
  child3Url,
  child4Label,
  child4Url,
  child5Label,
  child5Url,
  child6Label,
  child6Url,
  child7Label,
  child7Url,
  child8Label,
  child8Url,
}: NavLinkProps): React.ReactNode => {
  // Build the 8 fixed child slots. Empty label => slot is omitted (D-05).
  const allChildren = [
    { label: child1Label, url: child1Url },
    { label: child2Label, url: child2Url },
    { label: child3Label, url: child3Url },
    { label: child4Label, url: child4Url },
    { label: child5Label, url: child5Url },
    { label: child6Label, url: child6Url },
    { label: child7Label, url: child7Url },
    { label: child8Label, url: child8Url },
  ];

  // `.trim()` is load-bearing here, not tidiness (WR-07). This filter does not
  // merely decide whether a link is drawn — it decides WHICH BRANCH renders. A
  // single stray space typed into child1Label (easy to do in a 19-field
  // sidebar) would otherwise flip a saved nav item from a plain anchor to a
  // disclosure and add a blank, focusable submenu entry.
  const activeChildren = allChildren.filter((entry) => !!entry.label?.trim());

  // The parent's own destination stays reachable in the disclosure branch
  // (CR-02). A <summary> only toggles the disclosure, so without this the saved
  // `url` would be silently orphaned: the merchant edits "Enlace URL" in the
  // sidebar, and the nav item that used to navigate simply stops navigating,
  // with no other route to it on desktop OR mobile. `#` is the schema default
  // and means "no destination", so it is excluded — a merchant who never set a
  // real URL gets no duplicate dead entry.
  const parentUrl = url && url.trim() && url.trim() !== "#" ? url : undefined;

  // Hooks are called UNCONDITIONALLY and before the Branch A early return —
  // Rules of Hooks require a stable call order. `hasSubmenu` is the dependency
  // so that a merchant filling or clearing the last child label in the
  // customizer, which flips the rendered branch, re-runs the effect.
  const hasSubmenu = activeChildren.length > 0;
  const detailsRef = React.useRef<HTMLDetailsElement>(null);
  const summaryRef = React.useRef<HTMLElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = detailsRef.current;
    // THIS is D-04: in Branch A the ref was never attached, so an un-submenued
    // nav link returns here having subscribed to nothing at all.
    if (!el) return;
    const panel = panelRef.current;

    // `pointerdown`, not `click`: it fires before the click, so the panel is
    // already gone by the time a click lands on whatever was underneath, and it
    // covers touch and pen without a second listener. A press that starts on
    // the summary or inside the panel is INSIDE the element and is a no-op, so
    // the native toggle is never fought.
    const onPointerDown = (event: Event) => {
      // Cost bound for up to 8 nav items (site-header's maxBlocks): a closed
      // menu costs one boolean read per press, so always-attached is cheaper
      // than an add/remove state machine.
      if (!el.open) return;
      const target = event.target;
      if (!(target instanceof Node)) return;
      // Covers summary AND panel in one check, reading strictly INWARD from an
      // element this component itself rendered.
      if (el.contains(target)) return;
      el.open = false;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (!el.open || event.key !== "Escape") return;
      // Captured BEFORE closing: once the panel is un-rendered the browser has
      // already dropped a focused child link to <body>, so this order is
      // load-bearing. Escape pressed from elsewhere on the page still closes
      // the menu but must never yank focus across the page.
      const hadFocusInside = el.contains(document.activeElement);
      el.open = false;
      if (hadFocusInside) summaryRef.current?.focus();
    };

    // Scoped to the PANEL element via its own ref, not a document listener and
    // not a JSX handler — so the summary is untouched and opening stays native.
    const onPanelClick = () => {
      el.open = false;
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    panel?.addEventListener("click", onPanelClick);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      panel?.removeEventListener("click", onPanelClick);
    };
  }, [hasSubmenu]);

  // Branch A — no submenu. Byte-compatible with the pre-phase output.
  if (activeChildren.length === 0) {
    return (
      <a
        href={safeHref(url)}
        className="inline-flex items-center gap-1 font-opensans text-sm text-white whitespace-nowrap hover:text-brand-yellow focus-visible:outline-2 focus-visible:outline-brand-yellow focus-visible:outline-offset-2"
      >
        {label ?? "Enlace"}
        {/* In THIS branch only, the ChevronDown stays decorative (D-06): there
            is no submenu for it to reflect. */}
        {hasCaret && (
          <ChevronDown aria-hidden="true" className="size-4 shrink-0" />
        )}
      </a>
    );
  }

  // Branch B — native disclosure. lg:relative anchors the desktop panel.
  return (
    <details ref={detailsRef} className="group lg:relative">
      <summary ref={summaryRef} className="list-none cursor-pointer inline-flex items-center gap-1 font-opensans text-sm text-white whitespace-nowrap hover:text-brand-yellow [&::-webkit-details-marker]:hidden marker:content-[''] focus-visible:outline-2 focus-visible:outline-brand-yellow focus-visible:outline-offset-2">
        {label ?? "Enlace"}
        <ChevronDown
          aria-hidden="true"
          className="size-4 shrink-0 transition-transform group-open:rotate-180"
        />
      </summary>

      {/* Same markup, two layouts: inline accordion flow by default (mobile,
          inside the hamburger panel), dropdown panel on lg: only. z-50 is what
          the existing mobile nav panel already relies on to clear the section
          below the header. */}
      <div
        ref={panelRef}
        className="mt-2 flex flex-col gap-2 pl-3 lg:absolute lg:left-0 lg:top-full lg:z-50 lg:mt-3 lg:min-w-56 lg:gap-2 lg:rounded-xl lg:border lg:border-white/10 lg:bg-brand-navy lg:p-4 lg:pl-4 lg:shadow-xl">
        {/* The parent destination, first in the panel (CR-02). Rendered only
            when `url` is a real destination — never for the `#` default. */}
        {parentUrl && (
          <a
            href={safeHref(parentUrl)}
            className="flex min-h-6 items-center font-opensans text-sm font-bold text-white whitespace-nowrap hover:text-brand-yellow focus-visible:outline-2 focus-visible:outline-brand-yellow focus-visible:outline-offset-2"
          >
            {label ?? "Enlace"}
          </a>
        )}
        {activeChildren.map((entry, idx) => (
          <a
            key={idx}
            href={safeHref(entry.url)}
            className="flex min-h-6 items-center font-opensans text-sm text-white whitespace-nowrap hover:text-brand-yellow focus-visible:outline-2 focus-visible:outline-brand-yellow focus-visible:outline-offset-2"
          >
            {entry.label}
          </a>
        ))}
      </div>
    </details>
  );
};

// 19 settings: label + url + caret toggle + 8 pairs of (label, url) — fixed
// slot count, empty labels filtered out (D-05 precedent).
export const navLinkSettingsSchema = [
  {
    id: "label",
    label: "Texto",
    type: "text",
    default: "Enlace",
  },
  {
    id: "url",
    label: "Enlace URL",
    type: "url",
    default: "#",
    info: "Si agregas submenús, este enlace se muestra como la primera opción del submenú. Déjalo en # si el elemento no debe navegar.",
  },
  {
    id: "hasCaret",
    label: "Mostrar flecha",
    type: "checkbox",
    default: false,
  },
  {
    id: "child1Label",
    label: "Submenú 1 — Texto",
    type: "text",
    default: "",
  },
  {
    id: "child1Url",
    label: "Submenú 1 — URL",
    type: "url",
    default: "#",
  },
  {
    id: "child2Label",
    label: "Submenú 2 — Texto",
    type: "text",
    default: "",
  },
  {
    id: "child2Url",
    label: "Submenú 2 — URL",
    type: "url",
    default: "#",
  },
  {
    id: "child3Label",
    label: "Submenú 3 — Texto",
    type: "text",
    default: "",
  },
  {
    id: "child3Url",
    label: "Submenú 3 — URL",
    type: "url",
    default: "#",
  },
  {
    id: "child4Label",
    label: "Submenú 4 — Texto",
    type: "text",
    default: "",
  },
  {
    id: "child4Url",
    label: "Submenú 4 — URL",
    type: "url",
    default: "#",
  },
  {
    id: "child5Label",
    label: "Submenú 5 — Texto",
    type: "text",
    default: "",
  },
  {
    id: "child5Url",
    label: "Submenú 5 — URL",
    type: "url",
    default: "#",
  },
  {
    id: "child6Label",
    label: "Submenú 6 — Texto",
    type: "text",
    default: "",
  },
  {
    id: "child6Url",
    label: "Submenú 6 — URL",
    type: "url",
    default: "#",
  },
  {
    id: "child7Label",
    label: "Submenú 7 — Texto",
    type: "text",
    default: "",
  },
  {
    id: "child7Url",
    label: "Submenú 7 — URL",
    type: "url",
    default: "#",
  },
  {
    id: "child8Label",
    label: "Submenú 8 — Texto",
    type: "text",
    default: "",
  },
  {
    id: "child8Url",
    label: "Submenú 8 — URL",
    type: "url",
    default: "#",
  },
];
