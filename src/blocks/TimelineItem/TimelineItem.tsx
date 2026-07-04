import * as React from "react";

// TimelineItem (NOS-05) — section-local block for the NosotrosTimeline vertical
// rail. A single full-width milestone CARD (`relative ... pl-12`) with the dot
// living INSIDE the card as an `absolute left-4 top-6 z-20` node, and the
// DOTTED connector line drawn as the card's own `after:` pseudo-element that
// runs from THIS dot DOWN to the NEXT card's dot. The segment is anchored at a
// fixed top (`after:top-8` = the dot center, 32px) and a fixed overhang
// (`after:-bottom-12` = 48px below the card = gap 16px + next dot offset 32px),
// so it lands on the next dot regardless of card height. `last:after:hidden`
// removes the segment on the final card, so the line ends exactly at the last
// dot; the first card naturally has nothing above its dot. The line paints over
// the cards (`after:z-10`) and the dot sits on top of it (`z-20`) with a
// `ring-4 ring-card` card-colored halo. `pl-12` reserves the dot/line zone.
// This over-the-card treatment is user-directed (deviates from the shipped
// gutter-rail design). The card carries an authored TEXT year (incl. "HOY"), a
// title, and a body; each text field is guarded so a blank field renders
// nothing.
//
// No state, no event handlers, no hex literals, @/ imports only.
export interface TimelineItemProps {
  year?: string;
  title?: string;
  body?: string;
  blockId?: string;
  blockType?: string;
}

export const TimelineItem = ({
  year = "HOY",
  title = "Del mundo a tus manos",
  body = "",
}: TimelineItemProps): React.ReactNode => {
  return (
    <div className="relative flex flex-col items-start rounded-xl bg-card px-6 py-5 pl-12 shadow after:absolute after:left-6 after:top-8 after:-bottom-12 after:z-10 after:border-l-2 after:border-dotted after:border-brand-yellow after:content-[''] last:after:hidden">
      {/* Dot node INSIDE the card, sitting on top of this card's `after:`
          connector segment. `z-20` lifts it above the `z-10` line so it reads
          as a node on the line; `ring-4 ring-card` in the card color punches a
          gap around the dot. `left-4` centers the dot on the `after:left-6`
          line; `top-6` (center 32px) aligns with `after:top-8`. */}
      <span
        aria-hidden="true"
        className="absolute left-4 top-6 z-20 size-4 rounded-full bg-brand-yellow ring-4 ring-card"
      />
      {year && (
        <p className="mb-1 font-gotham text-xl font-bold text-brand-yellow">
          {year}
        </p>
      )}
      {title && (
        <h3 className="mb-2 font-gotham text-xl font-bold text-brand-navy">
          {title}
        </h3>
      )}
      {body && (
        <p className="font-gill text-base text-muted-foreground">{body}</p>
      )}
    </div>
  );
};

// Exactly 3 editable fields, ids → camelCase props.
export const timelineItemSettingsSchema = [
  {
    id: "year",
    label: "Año",
    type: "text",
    default: "HOY",
  },
  {
    id: "title",
    label: "Título",
    type: "text",
    default: "Del mundo a tus manos",
  },
  {
    id: "body",
    label: "Descripción",
    type: "textarea",
    default: "",
  },
];
