# Theta Theme Development Instructions

This document describes every convention, type, and API available when creating **sections** and **blocks** for a Theta theme. It applies to any theme built on this starter.

---

## Theme Registration

A theme bundle must register itself on the global `window.__THETA_THEMES__` namespace under its theme name:

```ts
window.__THETA_THEMES__ = window.__THETA_THEMES__ || {}
window.__THETA_THEMES__["my-theme"] = {
  name: "my-theme",
  version: "1.0.0",
  sectionsComponents,
  sectionSettingsSchemas,
  blocksComponents,       // optional
  blockSettingsSchemas,   // optional
  sectionBlocksConfig,    // optional
}
```

In this starter the registration lives in `src/index.ts` and the maps are assembled in `src/registry.ts`. The theme name is injected at build time from `package.json` `name` via `__THEME_NAME__` (see `vite.config.ts`) — it is the single source of truth, so you never hardcode the name in source. The build's contract test (`yarn build`) fails if the bundle registers under any other key.

---

## Available Globals in Theme Bundles

The platform injects these globals before loading the theme script. Do **not**
bundle them — they are declared as externals in `vite.config.ts` (each has a
matching `output.globals` entry mapping the module to the global name below):

| Global | Module | Externalized in starter |
|--------|--------|-------------------------|
| `React` | `react` | ✅ |
| `ReactDOM` | `react-dom` | ✅ |
| `jsxRuntime` | `react/jsx-runtime` | ✅ |
| `cva` | `class-variance-authority` | ✅ |
| `clsx` | `clsx` | ✅ |
| `twMerge` | `tailwind-merge` | ✅ |
| `LucideReact` | `lucide-react` | ✅ |
| `cn` | platform `lib/utils` | ⚠️ see note |

> **`cn`**: the platform also injects a `cn` global. This starter keeps its own
> tiny `cn` wrapper in `src/lib/utils.ts` (it's three lines, and its only
> dependencies — `clsx` and `tailwind-merge` — are themselves externalized, so
> the bundled copy is negligible). Either use the local `@/lib/utils` import (as
> the example components do) or externalize it to the platform global; both are
> fine. If you add new dependencies that the platform does **not** inject, those
> *do* get bundled — keep them small.

---

## `registry.ts` Structure

```ts
import type React from "react"
import { MySection, mySectionSettingsSchema } from "./sections/MySection"
import { MyBlock, myBlockSettingsSchema } from "./blocks/MyBlock"

// Section React components keyed by section type
export const sectionsComponents: Record<string, React.ComponentType<Record<string, unknown>>> = {
  "my-section": MySection,
}

// Settings schemas keyed by section type (same keys as above)
export const sectionSettingsSchemas = {
  "my-section": mySectionSettingsSchema,
}

// Block React components keyed by block type
export const blocksComponents: Record<string, React.ComponentType<Record<string, unknown>>> = {
  "my-block": MyBlock,
}

// Settings schemas keyed by block type
export const blockSettingsSchemas = {
  "my-block": myBlockSettingsSchema,
}

// Per-section block configuration
export const sectionBlocksConfig = {
  "my-section": {
    blocks: [{ type: "@theme" }], // "@theme" = all non-private theme blocks
    maxBlocks: 10,
    localBlocks: [], // section-exclusive blocks (not shared)
  },
}
```

---

## Section Component

### Props injected by the platform

In addition to all settings values, each section receives:

| Prop | Type | Description |
|------|------|-------------|
| `sectionId` | `string` | Unique editor instance ID |
| `sectionName` | `string` | The section type key (e.g. `"hero"`) |
| `renderBlocks` | `() => React.ReactNode` | Call this to render child blocks (only present when the section accepts blocks) |

---

## Block Component

### Props injected by the platform

In addition to all settings values, each block receives:

| Prop | Type | Description |
|------|------|-------------|
| `blockId` | `string` | Unique editor instance ID |
| `blockType` | `string` | The block type key (e.g. `"feature"`) |

---

## Settings Schema (`SectionSetting[]`)

Each setting in a schema is an object with the following interface:

```ts
interface SectionSetting {
  id: string                    // prop name passed to the component
  label: string                 // display label in the editor sidebar
  type: string                  // see setting types below
  default?: string | number | boolean | unknown
  info?: string                 // helper text shown below the input
  placeholder?: string          // for text-based inputs
  options?: Array<{ value: string | number | boolean; label: string }>  // for select/radio
  min?: number                  // for number / range
  max?: number                  // for number / range
  step?: number                 // for number / range
  metaobjectType?: string       // for metaobject_ref — the Strapi definition key
  readOnly?: boolean
  disabled?: boolean
  required?: boolean
}
```

---

## All Setting Types

| Type | Prop value | Notes |
|------|-----------|-------|
| `text` | `string` | Single-line text input. |
| `textarea` | `string` | Multi-line text input. |
| `number` | `number` | Supports `min` / `max` / `step`. |
| `checkbox` | `boolean` | Toggle. |
| `radio` | `string \| number \| boolean` | Requires `options`. |
| `select` | `string \| number \| boolean` | Requires `options`. |
| `range` | `number` | Slider; supports `min` / `max` / `step`. |
| `color` | `string` | Hex / CSS color. |
| `url` | `string` | URL text input. |
| `image_picker` | `{ id; url; alt?; width?; height? }` | Opens the media library. |
| `video_picker` | `{ id; url }` | Opens the media library (video). |
| `video_url` | `string` | External video URL (YouTube, Vimeo, …). |
| `font_picker` | `string` | Font family name. |
| `richtext` | `string` (HTML) | Rich text editor. |
| `html` | `string` (raw HTML) | Raw HTML editor. |
| `text_alignment` | `"left" \| "center" \| "right"` | Alignment picker. |
| `page_reference` | `{ id?; slug?; title? } \| string` | Reference another CMS page. |
| `metaobject_ref` | `string \| null` (documentId), resolved object on publish | Reference a Strapi metaobject entry. Set `metaobjectType` to the Strapi definition key. |

### `metaobject_ref` defensive contract

A `metaobject_ref` value arrives as a **raw documentId string** (or `{}` / `{ __missing: true }`) in the customizer and as a **fully resolved object** on the published site. Always render a placeholder for the string / missing / empty cases. See `src/blocks/ExampleRef/ExampleRef.tsx` for the reference implementation.

---

## Blocks Configuration

- **Global blocks** — defined in `blocksComponents` / `blockSettingsSchemas`; available to any section that references them.
- **Local blocks** — defined inline in `sectionBlocksConfig[key].localBlocks`; exclusive to that section.
- **`@theme` wildcard** — `{ type: "@theme" }` expands to all non-private theme blocks.
- **Private blocks** — prefix a block type with `_` (e.g. `"_internal"`) to exclude it from `@theme` expansion; it must then be listed explicitly.

---

## Key Naming Conventions

- Section and block keys can use kebab-case or any casing — they are normalized to lowercase internally.
- Keys must be consistent across `sectionsComponents`, `sectionSettingsSchemas`, `blocksComponents`, `blockSettingsSchemas`, and `sectionBlocksConfig`.
- The `id` field in a setting becomes the exact prop name passed to the component. Use camelCase for prop names (e.g. `id: "heroImage"` → `props.heroImage`).
