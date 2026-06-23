<!-- refreshed: 2026-06-23 -->
# Architecture

**Analysis Date:** 2026-06-23

## System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│         Theta Theme IIFE Bundle (dist/theme.bundle.js)      │
│                  Single-file Self-Contained                  │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│              Theme Registration Layer                        │
│              `src/index.ts` — Window Global Setup            │
│  Registers on: window.__THETA_THEMES__[themeName]           │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│               Theme Registry / Contract                      │
│               `src/registry.ts`                              │
│  ┌─────────────────┬──────────────────┬────────────────┐   │
│  │   Sections      │      Blocks      │  Block Config  │   │
│  │  Components &   │   Components &   │  (block tree   │   │
│  │  Settings       │   Settings       │  hierarchy)    │   │
│  └─────────────────┴──────────────────┴────────────────┘   │
└─────────────────────────────────────────────────────────────┘
         │
         ├─────────────────────────┬────────────────────┐
         ▼                         ▼                    ▼
┌──────────────────┐    ┌──────────────────┐  ┌────────────────┐
│  Section Layer   │    │  Block Layer     │  │ Utility Layer  │
│  `src/sections/` │    │  `src/blocks/`   │  │  `src/lib/`    │
│                  │    │                  │  │  `src/components/`
│ - Hero (accepts  │    │ - Feature        │  │                │
│   child blocks)  │    │ - ExampleRef     │  │ - cn() utility │
│                  │    │   (metaobject)   │  │ - UI primitives│
└──────────────────┘    └──────────────────┘  └────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| **Theme Registration** | Register bundle on `window.__THETA_THEMES__`, inject theme name/version at build time | `src/index.ts` |
| **Registry Contract** | Export five registry maps (sections, blocks, settings, block config) keyed by type | `src/registry.ts` |
| **Hero Section** | Page-level container section with text/CTA layout; accepts child blocks via `renderBlocks()` | `src/sections/Hero/Hero.tsx` |
| **Feature Block** | Child block displaying a single feature with icon; renders within sections | `src/blocks/Feature/Feature.tsx` |
| **ExampleRef Block** | Defensive metaobject reference block; shows placeholder for unresolved/missing refs | `src/blocks/ExampleRef/ExampleRef.tsx` |
| **UI Primitives** | Reusable button, aspect-ratio components with CVA variants | `src/components/ui/` |
| **Style Utilities** | `cn()` merges clsx and tailwind-merge for conditional class deduplication | `src/lib/utils.ts` |
| **Global Styles** | Tailwind theme tokens, color palette, typography, animations | `src/index.css` |

## Pattern Overview

**Overall:** Flat Registry + Externalized Build

**Key Characteristics:**
- **Single IIFE bundle** — All code compiled into one `theme.bundle.js`; React, icons, and utilities externalized to reduce duplication across multiple themes
- **Five-map registry** — Sections and blocks register via consistent maps keyed by kebab-case type strings
- **Props-driven configuration** — Each component receives all setting values as props; no state management
- **Parent-child hierarchy** — Sections call `renderBlocks()` prop to render child blocks; blocks are leaf nodes
- **Build-time constants** — Theme name and version injected from `package.json` to ensure single source of truth

## Layers

**Registration Layer:**
- Purpose: Self-register the theme bundle on the platform window global at runtime
- Location: `src/index.ts`
- Contains: IIFE wrapping that executes on load, reads externalized globals (React, cva, clsx, etc.)
- Depends on: The registry maps from `src/registry.ts`
- Used by: The Theta platform (host app); runs during bundle initialization

**Registry Layer:**
- Purpose: Export the five immutable maps (sections, blocks, settings, block config) that define what this theme offers
- Location: `src/registry.ts`
- Contains: `sectionsComponents`, `sectionSettingsSchemas`, `blocksComponents`, `blockSettingsSchemas`, `sectionBlocksConfig`
- Depends on: Individual section/block implementations
- Used by: `src/index.ts` for registration; the platform reads these maps to populate the editor

**Section Layer:**
- Purpose: Render page-level layout containers; can have child blocks
- Location: `src/sections/`
- Contains: React components (e.g., Hero, Future, etc.) + their settings schemas
- Depends on: UI primitives, Lucide icons, settings values passed as props
- Used by: Registry layer; the platform renders one section at a time

**Block Layer:**
- Purpose: Render reusable content blocks that nest inside sections
- Location: `src/blocks/`
- Contains: Simple or complex block components (Feature, ExampleRef, etc.) + settings schemas
- Depends on: UI primitives, Lucide icons, settings/reference values passed as props
- Used by: Sections via `renderBlocks()`; can accept complex data (metaobject references)

**Utility Layer:**
- Purpose: Shared CSS, UI components, and helper functions
- Location: `src/lib/` (helpers), `src/components/ui/` (UI primitives), `src/index.css` (styles)
- Contains: `cn()` function, Button, AspectRatio, Tailwind CSS theme tokens
- Depends on: CVA, clsx, tailwind-merge (externalized; available as globals)
- Used by: Section and block components for styling and UI

## Data Flow

### Primary Rendering Path (Edit/Publish)

1. **Platform reads registry** (`src/registry.ts`) — extracts sections, blocks, schemas, block config
2. **Platform renders section** — instantiates a section component (e.g., Hero) with:
   - All settings values from the customizer (e.g., `title`, `heroImage`, `textAlignment`)
   - Injected props: `sectionId`, `sectionName`, `renderBlocks` (if section accepts blocks)
3. **Section renders child blocks** — calls `renderBlocks()` prop which:
   - For each child block (e.g., Feature), instantiates the block component with:
     - All block settings values (e.g., `feature` text)
     - Injected props: `blockId`, `blockType`
4. **Blocks render** — leaf nodes; no children
5. **Platform renders CSS** — Tailwind-compiled stylesheet from `src/index.css` applied globally

### MetaObject Reference Resolution Path (ExampleRef)

1. **In customizer:** ExampleRefBlock receives `entry` as a **raw documentId string** or `{}` / `{ __missing: true }`
2. **Component defensive render** — checks if entry is string/missing/empty → shows placeholder
3. **On published site:** ExampleRefBlock receives `entry` as fully **resolved object** with title/subtitle/image
4. **Component real render** — displays the data; always has a fallback placeholder

**State Management:**
- **None** — components are pure and stateless; all state lives in the platform's editor/customizer
- Settings changes flow down as props; the platform handles undo/redo and save

## Key Abstractions

**Registry Maps:**
- Purpose: Define theme capability; platform uses these to populate editor sidebars
- Examples: `sectionsComponents`, `blockSettingsSchemas`
- Pattern: Flat objects keyed by lowercase/kebab-case type strings; keys must match across all five maps

**Settings Schema:**
- Purpose: Declare what editor inputs a component accepts and how to render them
- Examples: `{ id: "title", label: "Heading", type: "text", default: "..." }`
- Pattern: Array of setting objects; each `id` becomes a component prop; type determines editor widget

**Section Container:**
- Purpose: Page-level layout that may render child blocks
- Examples: Hero section with feature list
- Pattern: Receives `renderBlocks` prop; sections are the only components that render children

**Block Leaf:**
- Purpose: Reusable content unit inside a section; no children
- Examples: Feature list item, testimonial, image card
- Pattern: Pure components; all data from props (settings or metaobject reference)

**Externalized Globals:**
- Purpose: Avoid bundling React, icons, styling libraries; reduce theme bundle size and conflicts
- Examples: `React`, `LucideReact`, `cva`, `clsx`, `twMerge`
- Pattern: Declared in `vite.config.ts` `external`/`output.globals`; shimmed by test harness; injected by platform at runtime

## Entry Points

**Bundle Entry:**
- Location: `src/index.ts`
- Triggers: IIFE runs automatically when the bundle is loaded in the browser
- Responsibilities: 
  - Import all registry maps
  - Read `__THEME_NAME__` and `__THEME_VERSION__` build-time constants
  - Register the theme object on `window.__THETA_THEMES__[themeName]`
  - Export registry maps for the platform to read

**Section Entry (e.g., Hero):**
- Location: `src/sections/Hero/Hero.tsx`
- Triggers: Platform instantiates the section when rendering a page
- Responsibilities:
  - Render layout with all settings values (title, CTA, image, etc.)
  - Call `renderBlocks()` to render child blocks if any
  - Use `cn()` to merge Tailwind classes safely

**Block Entry (e.g., Feature):**
- Location: `src/blocks/Feature/Feature.tsx`
- Triggers: Section calls `renderBlocks()` or platform renders standalone block
- Responsibilities:
  - Render the component with its settings values
  - No children; no `renderBlocks` call

## Architectural Constraints

- **Threading:** Single-threaded browser JavaScript; no worker threads or async orchestration
- **Global state:** None. The theme is stateless. All component state is in the platform's customizer/editor.
- **Circular imports:** Registry imports from sections/blocks; sections/blocks do NOT re-import from registry (avoid cycles). Each section/block has a local `index.ts` barrel.
- **Build-time injection:** `__THEME_NAME__` and `__THEME_VERSION__` are replaced at compile time via `vite.config.ts` `define`; they are not runtime constants
- **Externalized dependencies:** React, ReactDOM, cvra, clsx, tailwind-merge, lucide-react are NOT bundled; they arrive as platform globals
- **Defensive prop contracts:** Blocks accepting `metaobject_ref` must handle string IDs (customizer), `{}`, and `{ __missing: true }` (unresolved states) in addition to fully resolved objects (published site)
- **Block hierarchy:** Only sections can render blocks. Blocks cannot contain blocks.

## Anti-Patterns

### Hardcoding Theme Name

**What happens:** Theme name is repeated as a string literal in `src/index.ts`
**Why it's wrong:** Renaming the theme in `package.json` won't update the registration key; registration fails or uses stale name
**Do this instead:** Read `__THEME_NAME__` injected from `vite.config.ts` (which reads `package.json`) — this is already done in `src/index.ts:17`

### Bundling Externalized Dependencies

**What happens:** React, clsx, or tailwind-merge are included in the built bundle
**Why it's wrong:** Multiple themes each ship their own copies; bloats all themes and causes version conflicts
**Do this instead:** Ensure each dependency is listed in `vite.config.ts` `rollupOptions.external` and has a matching `output.globals` entry

### Adding State to Components

**What happens:** A section or block uses `useState` to track local state
**Why it's wrong:** The platform controls all state; component state won't persist across edits or survive serialization
**Do this instead:** Keep components pure; all state arrives via props from the platform

### Not Handling MetaObject Reference Edge Cases

**What happens:** ExampleRef block assumes `entry` is always a resolved object
**Why it's wrong:** In the customizer, entry is a raw string ID; component crashes or shows blank cards
**Do this instead:** Check if entry is a string, `{}`, or `{ __missing: true }` and render a placeholder (see `src/blocks/ExampleRef/ExampleRef.tsx:35-50`)

### Importing Sections/Blocks into Each Other

**What happens:** Hero section imports a block component directly instead of using `renderBlocks()`
**Why it's wrong:** Breaks the registry's ability to reuse blocks across sections; creates tight coupling
**Do this instead:** Sections render blocks only via `renderBlocks()` prop; blocks are instantiated by the platform based on `sectionBlocksConfig`

## Error Handling

**Strategy:** Graceful degradation via placeholder rendering

**Patterns:**
- **Missing images** — Hero renders a neutral gray placeholder with "Add a hero image" text (`src/sections/Hero/Hero.tsx:84-88`)
- **Unresolved metaobject references** — ExampleRefBlock renders a placeholder card with empty state (`src/blocks/ExampleRef/ExampleRef.tsx:38-50`)
- **Falsy settings** — Components check for presence (e.g., `primaryCtaLabel &&`) before rendering optional elements
- **No validation errors** — Settings validation happens in the platform; the theme receives validated/default values only

## Cross-Cutting Concerns

**Styling:**
- Approach: Tailwind CSS v4 with `@theme inline` token mapping; all colors/utilities read from CSS variables in `:root`
- Application: Import `src/index.css` once at bundle entry; styles apply globally to all components
- Customization: Rebrand by editing OKLCH color values in `:root` (see `src/index.css`)

**Internationalization:**
- Approach: None built-in. All text is set via settings values; platform may provide i18n wrapper.
- Pattern: Settings can include translated text; components render as-is

**Accessibility:**
- Approach: Semantic HTML, ARIA labels, focus management via CVA-generated styles
- Pattern: Sections/blocks render `aria-labelledby`, `alt` attributes, focus rings inherited from CVA button variants

**Icon Library:**
- Approach: Lucide React externalized; import from `lucide-react` global
- Pattern: `import { ArrowRight } from "lucide-react"` (already shown in `src/sections/Hero/Hero.tsx:4`)

---

*Architecture analysis: 2026-06-23*
