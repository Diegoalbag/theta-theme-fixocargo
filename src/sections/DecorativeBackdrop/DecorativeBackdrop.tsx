import type React from "react";

// DecorativeBackdrop (quick task 260709-buk) — a zero-height, self-anchored,
// no-block settings-only section that paints an absolutely-positioned
// decorative image BEHIND every sibling section, regardless of where in the
// page's section list it's placed.
//
// 1. PLACEMENT / PHYSICAL REACH: this section is zero-height. Visually, the
//    image only extends DOWNWARD from this section's own anchor point (see
//    `reachVh`/`horizontalPosition` below) — so it must still be placed near
//    (immediately before) the group of sections it should visually cover.
//    Stacking is handled separately (point 3) — placement only controls
//    where in physical page space the image appears, not whether it's
//    behind other content.
// 2. OWN POSITIONING CONTEXT: the root establishes its OWN `position:
//    relative` positioning context rather than depending on any external
//    ancestor or `position: fixed` — the customizer wraps each section in
//    `position: relative` but the live site does not, so anchoring to this
//    section's own closer root resolves identically in both environments.
// 3. HARDCODED NEGATIVE Z-INDEX: the image has `zIndex: -1` baked in (never a
//    merchant-facing setting). Neither this section's own root nor the
//    platform's section wrappers (page-renderer.tsx on the live site,
//    RelayOverlay in the customizer) set a `z-index`, so none of them
//    establish a new stacking context — the image and every sibling section
//    share ONE stacking context. Within a shared stacking context, CSS
//    always paints negative-z-index positioned content BEHIND normal in-flow
//    content, regardless of DOM order. This is what makes the image sit
//    behind sections both before AND after it in the section list, on both
//    the live site and in the customizer.
export interface DecorativeBackdropProps {
  image?: {
    id: string;
    url?: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  reachVh?: number;
  horizontalPosition?: "left" | "center" | "right";
  horizontalOffset?: number;
  widthPx?: number;
  opacity?: number;
  sectionId?: string;
  sectionName?: string;
}

export const DecorativeBackdrop = ({
  image,
  reachVh = 100,
  horizontalPosition = "center",
  horizontalOffset = 0,
  widthPx = 600,
  opacity = 100,
}: DecorativeBackdropProps): React.ReactNode => {
  const hasImage = Boolean(image?.url);

  // Sign convention: positive `horizontalOffset` always nudges the image
  // RIGHT, negative always nudges it LEFT, regardless of which anchor is
  // selected — the anchor only sets the origin point, the offset is a
  // uniform additional `translateX` on top.
  const anchorStyle: React.CSSProperties =
    horizontalPosition === "left"
      ? { left: "0px" }
      : horizontalPosition === "right"
        ? { right: "0px" }
        : { left: "50%" };
  const translateX: string =
    horizontalPosition === "center"
      ? `calc(-50% + ${horizontalOffset}px)`
      : `${horizontalOffset}px`;

  return (
    <div
      className="relative h-0 overflow-visible pointer-events-none"
      aria-hidden="true"
    >
      {hasImage && (
        <img
          src={image!.url}
          alt=""
          width={image!.width}
          height={image!.height}
          loading="lazy"
          decoding="async"
          className="absolute top-0 object-contain"
          style={{
            width: `${widthPx}px`,
            height: `${reachVh}vh`,
            opacity: opacity / 100,
            transform: `translateX(${translateX})`,
            zIndex: -1,
            ...anchorStyle,
          }}
        />
      )}
    </div>
  );
};

// Exactly 6 editable fields, ids -> camelCase props, in the order the
// customizer sidebar should present them.
export const decorativeBackdropSettingsSchema = [
  {
    id: "image",
    label: "Imagen decorativa",
    type: "image_picker",
    default: undefined,
  },
  {
    id: "reachVh",
    label: "Alcance vertical (vh)",
    type: "range",
    min: 20,
    max: 300,
    step: 10,
    default: 100,
  },
  {
    id: "horizontalPosition",
    label: "Posición horizontal",
    type: "select",
    options: [
      { value: "left", label: "Izquierda" },
      { value: "center", label: "Centro" },
      { value: "right", label: "Derecha" },
    ],
    default: "center",
  },
  {
    id: "horizontalOffset",
    label: "Ajuste horizontal (px)",
    type: "number",
    min: -1000,
    max: 1000,
    default: 0,
  },
  {
    id: "widthPx",
    label: "Ancho (px)",
    type: "number",
    min: 50,
    max: 5000,
    default: 600,
  },
  {
    id: "opacity",
    label: "Opacidad",
    type: "range",
    min: 0,
    max: 100,
    step: 5,
    default: 100,
  },
];
