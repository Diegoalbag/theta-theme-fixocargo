import * as React from "react";

// TimelineItem (NOS-05) — section-local block for the NosotrosTimeline vertical
// rail. A single milestone row (`relative pl-11`) with the dot as an `absolute
// left-0 top-1.5` marker in the left gutter, sitting ON the parent section's
// solid-yellow absolute-overlay line; a `ring-4 ring-muted` halo in the band
// color punches a gap around the dot. This absolute-marker approach is
// intentional — it matches the shipped FixoCargo HISTORY design and the
// section's overlay connector. The card carries an authored TEXT year (incl.
// "HOY"), a title, and a body; each text field is guarded so a blank field
// renders nothing.
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
    <div className="relative pl-11">
      {/* Dot marker on the rail: a yellow dot as an absolute marker in the left
          gutter, sitting ON the parent section's solid-yellow overlay line. A
          `ring-4 ring-muted` halo in the band color (`bg-muted`) punches a gap
          around the dot. `top-1.5` aligns the dot center with the line and the
          card's first line. */}
      <span
        aria-hidden="true"
        className="absolute left-0 top-1.5 size-4 rounded-full bg-brand-yellow ring-4 ring-muted"
      />
      <div className="flex flex-col items-start rounded-xl bg-card px-6 py-5 shadow">
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
