import * as React from "react";
import { Menu, X, User } from "lucide-react";

import { BlocksSlot } from "@/lib/blocks-slot";
import { ImageGuard } from "@/lib/image-guard";
import { Button } from "@/components/ui/button";

// SiteHeader (CHR-02) — site-wide top navigation.
// Mobile nav uses a CSS-only details/summary hamburger — no useState, no React
// event handlers. The open/close state is managed entirely by the native
// <details> element.
//
// Block rendering note (Pitfall 3 from RESEARCH.md): The mobile drawer and the
// desktop nav are separate containers that each call BlocksSlot once. This is
// the accepted two-call pattern for Phase 2 because the CSS-reflow single-call
// alternative would require sharing one ReactNode instance across two mount
// points, which is not safe in the customizer. In practice the customizer
// drag/drop slot is always the FIRST mount in the DOM (mobile details), so
// the customizer drag UX is unaffected. The desktop nav renders a second
// BlocksSlot for the published/preview path. This limitation is documented
// and tracked for future improvement.
//
// All text arrives as optional props (platform-validated strings).
// Icons are decorative (aria-hidden). No state, no event handlers in this file.
export interface SiteHeaderProps {
  logo?: {
    id: string;
    url?: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  accountLabel?: string;
  accountUrl?: string;
  renderBlocks?: () => React.ReactNode;
  sectionId?: string;
  sectionName?: string;
}

export const SiteHeader = ({
  logo,
  accountLabel,
  accountUrl,
  renderBlocks,
}: SiteHeaderProps): React.ReactNode => {
  return (
    <header className="bg-brand-navy">
      <div className="container mx-auto container-padding-x flex items-center justify-between py-3">
        {/* Logo */}
        <div className="max-w-[140px]">
          <ImageGuard
            url={logo?.url}
            alt={logo?.alt ?? ""}
            ratio={3 / 1}
            className="object-contain"
          />
        </div>

        {/* Mobile hamburger — CSS-only via <details>/<summary>. No useState. */}
        {/* details is hidden at desktop (lg:hidden). */}
        <details className="group lg:hidden">
          <summary
            className="list-none cursor-pointer h-11 flex items-center [&::-webkit-details-marker]:hidden marker:content-[''] text-white"
            aria-label="Abrir menú"
          >
            {/* Menu icon shown when drawer is closed */}
            <Menu
              aria-hidden="true"
              className="size-6 group-open:hidden"
            />
            {/* X icon shown when drawer is open */}
            <X
              aria-hidden="true"
              className="size-6 hidden group-open:flex"
            />
          </summary>
          {/* Mobile nav drawer — appears below the header bar */}
          <nav
            aria-label="Navegación móvil"
            className="absolute left-0 right-0 top-full z-50 bg-brand-navy flex flex-col gap-1 px-4 py-3 shadow-lg"
          >
            {/* BlocksSlot call #1 (mobile). This is the primary slot for the
                customizer drag/drop UX. empty={null} = no affordance when empty
                (nav slot should be invisible when merchant has no nav links). */}
            <BlocksSlot
              renderBlocks={renderBlocks}
              empty={null}
              className="flex flex-col gap-1"
            />
          </nav>
        </details>

        {/* Desktop nav — hidden on mobile, flex-row at lg+ */}
        {/* BlocksSlot call #2 (desktop). See Pitfall 3 comment at top of file. */}
        <nav
          aria-label="Navegación principal"
          className="hidden lg:flex items-center gap-6"
        >
          <BlocksSlot
            renderBlocks={renderBlocks}
            empty={null}
            className="flex items-center gap-6"
          />
        </nav>

        {/* Account button — pill-outline Button with asChild anchor (D-06) */}
        <div className="ml-4 shrink-0">
          <Button variant="pill-outline" asChild>
            <a
              href={accountUrl || "#"}
              className="inline-flex items-center gap-2"
            >
              <User aria-hidden="true" className="size-4" />
              <span>{accountLabel || "Mi Cuenta"}</span>
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
};

// Settings schema for the SiteHeader section.
// Three settings: logo image picker, account button text, account button URL.
export const siteHeaderSettingsSchema = [
  {
    id: "logo",
    label: "Logo",
    type: "image_picker",
    default: undefined,
  },
  {
    id: "accountLabel",
    label: "Texto del botón de cuenta",
    type: "text",
    default: "Mi Cuenta",
  },
  {
    id: "accountUrl",
    label: "URL de cuenta",
    type: "url",
    default: "#",
  },
];
