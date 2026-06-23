import type React from "react";
import { Demo, demoSettingsSchema } from "./sections/_demo";
import { SocialLink, socialLinkSettingsSchema } from "./blocks/SocialLink";
import { StoreBadge, storeBadgeSettingsSchema } from "./blocks/StoreBadge";

// ---------------------------------------------------------------------------
// The registry is the heart of a theme. Five maps, all keyed by the same
// lowercase/kebab-case type strings. Add a section or block by adding an entry
// to each relevant map below. Keys MUST stay consistent across all maps.
// ---------------------------------------------------------------------------

// Section React components keyed by section type.
export const sectionsComponents: Record<
  string,
  React.ComponentType<Record<string, unknown>>
> = {
  // `_demo` is private (`_` prefix) — kept only to keep this map non-empty for
  // the registration contract; removed at the start of Phase 2.
  _demo: Demo as React.ComponentType<Record<string, unknown>>,
};

// Settings schemas keyed by section type (same keys as sectionsComponents).
export const sectionSettingsSchemas = {
  _demo: demoSettingsSchema,
};

// Block React components keyed by block type (Shopify-style child blocks).
export const blocksComponents: Record<
  string,
  React.ComponentType<Record<string, unknown>>
> = {
  "social-link": SocialLink as React.ComponentType<Record<string, unknown>>,
  "store-badge": StoreBadge as React.ComponentType<Record<string, unknown>>,
};

// Block settings schemas keyed by block type.
export const blockSettingsSchemas: Record<
  string,
  Array<{
    id: string;
    label: string;
    type: string;
    default?: string | number | boolean | unknown;
    info?: string;
    placeholder?: string;
    options?: Array<{ value: string | number | boolean; label: string }>;
    metaobjectType?: string;
  }>
> = {
  "social-link": socialLinkSettingsSchema,
  "store-badge": storeBadgeSettingsSchema,
};

// Per-section block config: which blocks each section accepts.
//   { type: "@theme" } — accept all non-private theme blocks.
//   { type: "feature" } — accept only that specific block type.
//   localBlocks — section-exclusive blocks defined inline (not shared).
export const sectionBlocksConfig: Record<
  string,
  {
    blocks: Array<{ type: string }>;
    maxBlocks?: number;
    localBlocks?: Array<{
      type: string;
      name: string;
      component?: React.ComponentType<Record<string, unknown>>;
      settings: Array<{
        id: string;
        label: string;
        type: string;
        default?: string | number | boolean | unknown;
        info?: string;
        options?: Array<{ value: string | number | boolean; label: string }>;
      }>;
    }>;
  }
> = {
  _demo: {
    blocks: [{ type: "@theme" }],
    maxBlocks: 12,
  },
};
