import * as React from "react";
import { MapPin, ChevronDown } from "lucide-react";

import { BlocksSlot } from "@/lib/blocks-slot";

// AnnouncementBar (CHR-01) — page-top chrome bar with a location label,
// a static change-location caret, and a social-link child block slot.
// All text arrives as optional props (platform-validated strings).
// Text is rendered via JSX interpolation (React auto-escapes).
// Icons are decorative (aria-hidden) — the accessible semantics live in the
// role="banner" landmark on the outer wrapper.
export interface AnnouncementBarProps {
  locationLabel?: string;
  changeLabel?: string;
  followLabel?: string;
  renderBlocks?: () => React.ReactNode;
  sectionId?: string;
  sectionName?: string;
}

export const AnnouncementBar = ({
  locationLabel,
  changeLabel,
  followLabel,
  renderBlocks,
}: AnnouncementBarProps): React.ReactNode => {
  return (
    <div role="banner" className="bg-brand-navy text-white">
      <div className="container mx-auto container-padding-x flex flex-wrap items-center justify-end gap-3 py-4">
        {/* Left side: location + change label
        <div className="flex items-center gap-3 font-opensans text-sm">
          <MapPin aria-hidden="true" className="size-4 text-brand-yellow" />
          {locationLabel && <span>{locationLabel}</span>}
          {changeLabel && (
            <span className="inline-flex items-center gap-1">
              {changeLabel}

              <ChevronDown aria-hidden="true" className="size-4" />
            </span>
          )}
        </div>
        */}
        {/* Right side: follow label + social-link blocks slot */}
        <div className="flex items-center gap-4">
          {followLabel && (
            <span className="font-opensans text-sm">{followLabel}</span>
          )}
          {/* empty={null}: when social slot is empty, render nothing (WR-01) */}
          <BlocksSlot
            renderBlocks={renderBlocks}
            empty={null}
            className="flex items-center gap-5 h-5"
          />
        </div>
      </div>
    </div>
  );
};

// Settings schema for the AnnouncementBar section.
// Three editable text fields — all optional, all editable by the merchant.
export const announcementBarSettingsSchema = [
  {
    id: "locationLabel",
    label: "Ubicación",
    type: "text",
    default: "SD | República de Colombia",
  },
  {
    id: "changeLabel",
    label: "Texto de cambio",
    type: "text",
    default: "Cambiar",
  },
  {
    id: "followLabel",
    label: "Texto de seguir",
    type: "text",
    default: "Síguenos en:",
  },
];
