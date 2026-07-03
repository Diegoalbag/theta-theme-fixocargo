import * as React from "react";

// TimelineItem (NOS-05) — section-local block for the NosotrosTimeline vertical
// rail. A single full-width milestone CARD (`relative ... pl-12`) with the dot
// living INSIDE the card as an `absolute left-4 top-6 z-20` marker that sits ON
// TOP of the parent section's solid-yellow overlay line (which paints over the
// card at `z-10`). A `ring-4 ring-card` halo in the card color punches a gap
// around the dot so it reads as a node on the line. `pl-12` reserves the
// dot/line zone so the text clears it. This over-the-card treatment is
// user-directed (deviates from the shipped gutter-rail design). The card
// carries an authored TEXT year (incl. "HOY"), a title, and a body; each text
// field is guarded so a blank field renders nothing.
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
    <div className="relative flex flex-col items-start rounded-xl bg-card px-6 py-5 pl-12 shadow">
      {/* Dot node INSIDE the card, sitting on top of the parent section's
          solid-yellow overlay line. `z-20` lifts it above the `z-10` line so it
          reads as a node on the line; `ring-4 ring-card` in the card color
          punches a gap around the dot. `left-4` centers on the section line
          (`left-6`); `top-6` aligns the dot with the card's year line. */}
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
