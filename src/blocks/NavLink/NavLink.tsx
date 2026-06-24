import * as React from "react";
import { ChevronDown } from "lucide-react";

// NavLink — section-local block for SiteHeader navigation items.
// Each nav link renders as a bare anchor (not a Button) with an optional
// decorative caret icon. Per D-06, hasCaret=true shows a visual ChevronDown
// ONLY — there is no dropdown, no submenu, and no interactive behavior
// associated with the caret. It is purely decorative.
//
// No state, no event handlers. All content arrives as props from the platform.
export interface NavLinkProps {
  label?: string;
  url?: string;
  hasCaret?: boolean;
  blockId?: string;
  blockType?: string;
}

export const NavLink = ({
  label,
  url,
  hasCaret = false,
}: NavLinkProps): React.ReactNode => {
  return (
    <a
      href={url || "#"}
      className="inline-flex items-center gap-1 font-opensans text-sm text-white whitespace-nowrap hover:text-brand-yellow focus-visible:outline-2 focus-visible:outline-brand-yellow focus-visible:outline-offset-2"
    >
      {label ?? "Enlace"}
      {/* D-06: ChevronDown is decorative only — no dropdown, no submenu behavior */}
      {hasCaret && (
        <ChevronDown aria-hidden="true" className="size-4 shrink-0" />
      )}
    </a>
  );
};

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
  },
  {
    id: "hasCaret",
    label: "Mostrar flecha",
    type: "checkbox",
    default: false,
  },
];
