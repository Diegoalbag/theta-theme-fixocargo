import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import BlazeSlider from "blaze-slider";

import { EmptyState } from "@/lib/empty-state";

// Hero (ATF-01) — above-the-fold carousel of hero-slide blocks, driven by
// Blaze Slider (https://blaze-slider.dev). Replaces the original no-JS
// scroll-snap track: that approach could not give real slide navigation and its
// dot row had to be hardcoded (the slide count was unknowable statelessly),
// which is why a single slide always showed three dots.
//
// Statelessness note: a JS slider necessarily needs imperative init, so this is
// the one section that uses `useRef` + `useEffect`. There is NO React *state*
// (no useState) — refs hold the slider instance and last-known slide count, and
// the effect only drives Blaze imperatively. Render output stays a pure function
// of props.
//
// Why this works in BOTH the published site and the customizer:
//   • Published: `renderBlocks()` returns a bare array of slide elements, which
//     we wrap in our own `.blaze-track`.
//   • Customizer: `renderBlocks()` returns the host's single slot wrapper
//     `<div style="display:contents">…</div>`. We call it WITH
//     `{ className: "blaze-track", style: { display: "flex" } }` — the host
//     spreads our style AFTER `display:contents`, so `display:flex` wins and the
//     host wrapper itself becomes the real flex track, with the slides as its
//     direct children. No DOM mutation: React owns every node in both contexts.
//
// Blaze runs with `loop: false` ON PURPOSE: loop mode physically reorders slide
// DOM nodes (wrapNext/wrapPrev), which would corrupt the host's React
// reconciliation when a merchant edits a slide. loop:false scrolls via transform
// only. (Autoplay requires loop, so it is likewise deferred.)
export interface HeroProps {
  renderBlocks?: (slotProps?: {
    style?: React.CSSProperties;
    className?: string;
  }) => React.ReactNode;
  sectionId?: string;
  sectionName?: string;
}

const BLAZE_CONFIG = {
  all: {
    slidesToShow: 1,
    slidesToScroll: 1,
    slideGap: "0px",
    loop: false,
    enablePagination: true,
    enableAutoplay: false,
    transitionDuration: 400,
    draggable: true,
  },
};

export const Hero = ({ renderBlocks }: HeroProps): React.ReactNode => {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const sliderRef = React.useRef<BlazeSlider | null>(null);
  // -1 = "not yet measured", so the first effect run always initializes.
  const slideCountRef = React.useRef(-1);
  // The `.blaze-track` element Blaze is currently bound to. In the Puck
  // customizer the track IS Puck's slot <div>, which Puck can REMOUNT (swap for
  // a new DOM node) on edits — Blaze would then keep transforming the old,
  // detached node (dots advance, but the live slide never moves). We track the
  // bound element and re-create Blaze whenever its identity changes.
  const trackRef = React.useRef<HTMLElement | null>(null);
  // Editor-only transform guard: Puck re-asserts the slot div's `style` on
  // re-render, dropping Blaze's inline `transform`. The MutationObserver
  // re-applies the last transform whenever it gets wiped. On the published site
  // nothing owns/clobbers the track's style, so it only ever records.
  const transformObserverRef = React.useRef<MutationObserver | null>(null);
  const lastTransformRef = React.useRef<string>("");

  // (Re)initialize Blaze. Runs after EVERY render (the host re-renders Hero on
  // block edits) and acts only when the track element OR the slide count
  // actually changes:
  //   • track element changed  -> destroy + create a fresh instance bound to the
  //     live node (and re-arm the transform guard on it);
  //   • count changed (same element) -> Blaze.refresh() with the new totalSlides
  //     (no new instance, so no leaked resize listener).
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const track = root.querySelector<HTMLElement>(".blaze-track");
    const count = track ? track.children.length : 0;
    const trackChanged = track !== trackRef.current;
    const countChanged = count !== slideCountRef.current;
    if (!trackChanged && !countChanged) return;
    slideCountRef.current = count;

    const teardown = () => {
      transformObserverRef.current?.disconnect();
      transformObserverRef.current = null;
      sliderRef.current?.destroy();
      sliderRef.current = null;
    };

    if (trackChanged) {
      teardown();
      trackRef.current = track;
      if (track && count > 0) {
        sliderRef.current = new BlazeSlider(root, BLAZE_CONFIG);
        if (typeof MutationObserver !== "undefined") {
          lastTransformRef.current = track.style.transform || "";
          const observer = new MutationObserver(() => {
            const current = track.style.transform;
            if (current && current !== "none") {
              lastTransformRef.current = current;
            } else if (
              lastTransformRef.current &&
              lastTransformRef.current !== "none"
            ) {
              track.style.transform = lastTransformRef.current;
            }
          });
          observer.observe(track, {
            attributes: true,
            attributeFilter: ["style"],
          });
          transformObserverRef.current = observer;
        }
      }
      return;
    }

    // Same element, count changed.
    if (!track || count <= 0) {
      teardown();
      trackRef.current = null;
    } else if (sliderRef.current) {
      sliderRef.current.totalSlides = count;
      sliderRef.current.refresh();
    }
  });

  // Tear down on unmount. Reset refs so a StrictMode/HMR remount reinitializes.
  React.useEffect(() => {
    return () => {
      transformObserverRef.current?.disconnect();
      transformObserverRef.current = null;
      sliderRef.current?.destroy();
      sliderRef.current = null;
      trackRef.current = null;
      slideCountRef.current = -1;
    };
  }, []);

  // See the file header: passing className/style turns the customizer's
  // display:contents slot wrapper into the real `.blaze-track`.
  const rendered = renderBlocks?.({
    className: "blaze-track",
    // Force a horizontal, non-wrapping row. display:flex alone is not enough in
    // the Puck customizer: its slot <div> defaults to a vertical (column) drop
    // layout, so without flexDirection:row the slides stack and Blaze's
    // translateX has nothing to reveal. flexWrap:nowrap keeps the full-width
    // slides on one line instead of wrapping.
    style: { display: "flex", flexDirection: "row", flexWrap: "nowrap" },
  });
  // Customizer => a single wrapper element; published-with-blocks => a
  // non-empty array; published-zero => undefined OR an empty array. An empty
  // array is the canonical published-zero shape (matches BlocksSlot Test B), so
  // it must fall through to EmptyState — not paint an empty `.blaze-track`.
  const customizerWrapped = React.isValidElement(rendered);
  const hasBlocks =
    rendered != null && !(Array.isArray(rendered) && rendered.length === 0);

  return (
    <section role="region" aria-label="Carrusel destacado" className="relative">
      <div ref={rootRef} className="blaze-slider">
        <div className="blaze-container">
          <div className="blaze-track-container relative min-h-[60vh] md:min-h-[560px]">
            {/* Customizer-only drop affordance: shown behind the (empty) track
                so the merchant can see where hero slides go. Real slides are
                full-bleed and paint over it. */}
            {customizerWrapped && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 flex items-center justify-center border-2 border-dashed border-white/30 bg-brand-navy/40 text-sm text-white/70"
              >
                Arrastra bloques de hero aquí
              </div>
            )}

            {customizerWrapped ? (
              // The host wrapper IS the .blaze-track (class injected above).
              rendered
            ) : hasBlocks ? (
              <div className="blaze-track">{rendered}</div>
            ) : (
              <EmptyState />
            )}
          </div>

          {/* Functional controls. Blaze wires onclick to .blaze-prev/.blaze-next
              and fills .blaze-pagination with one dot per slide. CSS hides all of
              them unless the track holds 2+ slides. */}
          <button
            type="button"
            aria-label="Slide anterior"
            className="blaze-prev absolute left-4 top-1/2 z-10 size-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50"
          >
            <ChevronLeft aria-hidden="true" className="size-6" />
          </button>
          <button
            type="button"
            aria-label="Slide siguiente"
            className="blaze-next absolute right-4 top-1/2 z-10 size-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50"
          >
            <ChevronRight aria-hidden="true" className="size-6" />
          </button>
          <div
            className="blaze-pagination absolute inset-x-0 bottom-6 z-10 items-center justify-center gap-2"
            aria-label="Paginación del carrusel"
          />
        </div>
      </div>
    </section>
  );
};

// No editable section-level settings — all editable content lives on the
// hero-slide blocks (D-04: background is per-slide, not section-level).
export const heroSettingsSchema = [];
