import * as React from "react";

// TimelineItem (NOS-05) — section-local block for the NosotrosTimeline vertical
// rail. A single milestone row: a coordinate-free dot marker pulled onto the
// parent section's yellow rail with a negative-margin scale utility (`-ms-6`),
// NEVER `absolute` positioning and NEVER a bracketed offset like `-ml-[9px]`,
// followed by a card with an authored TEXT year (incl. "HOY"), a title, and a
// body. Each text field is guarded so a blank field renders nothing.
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
    <div className="flex items-start gap-4">
      {/* Dot marker on the rail: a yellow dot pulled onto the parent section's
          `border-l-2` connector with a negative-margin scale utility. Never
          `absolute`, never a bracketed offset. */}
      <span
        aria-hidden="true"
        className="-ms-6 mt-1 size-4 shrink-0 rounded-full bg-brand-yellow"
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
