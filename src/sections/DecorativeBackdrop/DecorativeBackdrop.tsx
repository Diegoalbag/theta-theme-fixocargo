import type React from "react";

// DecorativeBackdrop (quick task 260709-buk) — a zero-height, self-anchored,
// no-block settings-only section that paints an absolutely-positioned
// decorative image bleeding DOWNWARD across the following sections in the
// page's section list.
//
// 1. PLACEMENT / DIRECTION: this section is zero-height and must be placed
//    immediately BEFORE the group of sections it should visually sit behind.
//    Sections paint in page-section-list DOM order with no ancestor
//    establishing overflow/clipping; a zero-height section between section N
//    and N+1 paints OVER N (comes after N in the DOM) but BEHIND N+1, N+2, …
//    (they come later in the DOM and paint on top of it). This section only
//    supports reaching DOWNWARD — do not attempt to make it reach upward by
//    reordering z-index or position tricks; that is a different, unsupported
//    design.
// 2. OWN POSITIONING CONTEXT: the root establishes its OWN `position:
//    relative` positioning context rather than depending on any external
//    ancestor or `position: fixed` — the customizer wraps each section in
//    `position: relative` but the live site does not, so anchoring to this
//    section's own closer root resolves identically in both environments.
// 3. NO Z-INDEX: there is deliberately no `z-index` setting on this section —
//    stacking order is implicit via DOM/section-list placement only. Do not
//    add one without revisiting point 1.
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
