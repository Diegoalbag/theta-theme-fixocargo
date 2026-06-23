<!-- GSD:project-start source:PROJECT.md -->

## Project

**FixoCargo Theme**

A Theta platform theme that reproduces the FixoCargo courier/logistics website design as a set of fully responsive, content-editable sections and blocks. It is built on the `theta-theme-starter` (IIFE bundle, five-map registry) and lets non-technical merchants edit the FixoCargo homepage — headlines, imagery, links, navigation, services, branches, FAQs, and blog cards — through the Theta customizer in `project-theta-fe`.

**Core Value:** Every part of the FixoCargo design renders faithfully in the customizer and is editable by a non-technical merchant — repeating content (nav, services, branches, FAQs, blogs) can be added, removed, and reordered as child blocks.

### Constraints

- **Tech stack**: React 19 + TypeScript + Tailwind CSS 4, bundled as a single IIFE — must match starter build; React/cva/clsx/twMerge/lucide-react stay externalized (never bundled).
- **Contract**: Keys must be consistent across all five registry maps; bundle must register under the `package.json` name only (contract test enforces).
- **Component purity**: Sections/blocks are stateless; all data arrives as props from the platform — no `useState`, no local state.
- **Block hierarchy**: Only sections render blocks (via `renderBlocks()`); blocks cannot contain blocks.
- **Editability**: Content-only — text/images/links editable; brand colors and fonts fixed in `src/index.css`.
- **Fidelity**: Responsive implementation should faithfully match the FixoCargo visual design across breakpoints.

<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->

## Technology Stack

## Languages

- TypeScript 5.x - Type-safe development for components, registry, and build configuration
- JSX/TSX - React component syntax for sections and blocks
- CSS - Tailwind CSS utility-first styling

## Runtime

- Node.js (v22+ recommended based on `@types/node` ^22.0.0)
- Yarn (Corepack-managed, v3+)
- Lockfile: `yarn.lock` present

## Frameworks

- React 19.x - UI component framework (peer dependency)
- React DOM 19.x - DOM rendering (peer dependency)
- Tailwind CSS 4.1.x - Utility-first CSS framework
- @tailwindcss/vite 4.1.x - Vite plugin for Tailwind
- Tailwind Merge 3.4.x - De-duplicate Tailwind utilities in class names
- Radix UI React (slot and aspect-ratio) - Unstyled, accessible component primitives
- Lucide React 0.553.x - Icon library used in components (`ArrowRight`, `Check`)
- Vite 7.2.x - Lightning-fast build tool, configured for IIFE library output
- @vitejs/plugin-react 5.1.x - React Fast Refresh for Vite

## Key Dependencies

- `class-variance-authority` 0.7.x - Type-safe CSS variant generation for components like Button
- `clsx` 2.1.x - Conditional className utility
- `tw-animate-css` 1.4.x - Tailwind animation utilities
- `react-jsx-runtime` (via React 19) - JSX transform for automatic runtime imports

## Testing

- Vitest 4.1.x - Unit/contract testing runner
- JSDOM 29.1.x - DOM simulation for bundle registration tests

## Configuration

- Build-time substitution: `__THEME_NAME__` and `__THEME_VERSION__` injected from `package.json` via Vite
- No `.env` file used; configuration driven by `package.json` and build flags
- `vite.config.ts` - IIFE library build configuration
- `tsconfig.json` - TypeScript configuration
- `vitest.config.ts` - Test runner configuration

## Platform Requirements

- Node.js 22+ (inferred from @types/node)
- Yarn 3+ (Corepack)
- Git (for version control)
- Browser with ES2017+ support
- Platform injects globals: `React`, `ReactDOM`, `jsxRuntime`, `cva`, `clsx`, `twMerge`, `LucideReact` (defined in vite.config.ts externals)
- Theme publishes as single IIFE bundle to `window.__THETA_THEMES__[themeName]`

<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

## Naming Patterns

- React components: PascalCase (e.g., `Hero.tsx`, `FeatureBlock.tsx`, `Button.tsx`)
- Non-component files: camelCase (e.g., `registry.ts`, `utils.ts`, `contract-assertions.ts`)
- Index files: `index.ts` for barrel exports
- Settings schemas: camelCase with "SettingsSchema" suffix (e.g., `heroSettingsSchema`, `featureBlockSettingsSchema`)
- Components: PascalCase (exported as `export const ComponentName = () => {}`)
- Regular functions: camelCase (e.g., `assertContract`, `hasNoDisplayFields`)
- Private/internal utilities: camelCase, optionally with `_` prefix for truly private module-level functions
- Constants (records, objects, settings): camelCase (e.g., `alignmentClasses`, `blockSettingsSchemas`)
- React props interfaces: PascalCase with "Props" suffix (e.g., `HeroProps`, `FeatureBlockProps`, `ExampleRefBlockProps`)
- Component instance variables: camelCase (e.g., `textAlignment`, `primaryCtaLabel`)
- Interface names: PascalCase with semantic suffix (e.g., `HeroProps`, `ExampleRefData`, `ExampleRefBlockProps`)
- Type aliases: PascalCase (e.g., `VariantProps<typeof buttonVariants>`)
- Exported data types: Semantically named, PascalCase (e.g., `ExampleRefData`, `SectionSetting`)

## Code Style

- No explicit linter/formatter in project — follows TypeScript defaults
- Indentation: 2 spaces (observed in all `.ts`, `.tsx`, `.css` files)
- Line length: typically 80-100 characters (CLAUDE.md comments wrap at ~76 chars)
- Semicolons: Present at end of statements (TypeScript/React convention)
- Organized by source (node stdlib, external libraries, relative imports)
- Node imports use `import ... from "node:*"` syntax (e.g., `"node:fs"`, `"node:path"`)
- React/JSX imports: `import * as React from "react"` (not default imports) in component files
- Path aliases: `@/*` resolves to `./src/*` (configured in `tsconfig.json` and `vite.config.ts`)
- React 19 jsx-runtime (externalized, not bundled)
- Attributes on multiple lines when object spreads occur
- Fragment usage: `<>...</>` for unnamed fragments
- AriaAttributes: Full `aria-*` syntax (e.g., `aria-labelledby="hero-heading"`)

## Import Organization

- `@/*` → maps to `./src/*`
- Used consistently across components, utilities, and tests
- Never use relative `../../../` paths — always use `@/`

## Error Handling

- Defensive guards for optional/nullable values (e.g., checking `entry?.url` before rendering)
- Early-return pattern for invalid states (ExampleRef: `if (!entry || typeof entry === "string" || entry.__missing || hasNoDisplayFields(entry)) { return <placeholder> }`)
- Contract assertions throw with descriptive error messages (see `contract-assertions.ts`)
- `@ts-ignore` comments used sparingly for known type narrowing issues (e.g., Radix UI `Slot`)
- metaobject references arrive in two forms:
- Always render a graceful placeholder for string/missing/empty cases to prevent crashes
- Reference implementation: `src/blocks/ExampleRef/ExampleRef.tsx`

## Logging

- Reserved for build-time diagnostics and contract violations
- Runtime logging: minimal (theme bundles execute in browser context where full logging is host responsibility)
- Build diagnostics: console output used for build-time registration verification

## Comments

- Complex business logic or defensive patterns (metaobject refs, contract assertions)
- Architectural decisions (e.g., externalized globals, IIFE design, jsdom test setup)
- Security notes (e.g., ASVS V14 comments in tests about only evaluating local bundles)
- Settings schema documentation (setting types and constraints)
- TypeScript interfaces auto-document through type signatures
- Function parameters documented through typed function signatures and optional props
- Complex type unions use inline comments (e.g., `entry?: ExampleRefData | string`)

## Function Design

- React components use props object destructuring with interface types
- Utility functions use positional parameters with type annotations
- Optional parameters use `?:` syntax with `??` defaults in component bodies
- React components return `React.ReactNode` (JSX elements)
- Settings schemas return arrays of settings objects
- Utilities return typed values (strings, booleans, void for side effects)

## Module Design

- Index files use barrel exports: `export * from "./ComponentName"`
- Components export both the component (`export const ComponentName = ...`) and props interface (`export interface ComponentNameProps`)
- Settings schemas exported as named constants (e.g., `export const heroSettingsSchema = [...]`)
- Registry maps exported as named constants with explicit type annotations
- Pattern: `src/sections/[Section]/index.ts` and `src/blocks/[Block]/index.ts`
- Each barrel re-exports the main component file
- Registry imports components from barrel exports, then defines maps
- Target: ES2017
- Module: ESNext
- JSX: react-jsx
- moduleResolution: bundler
- Strict mode: not explicitly set (default behavior)
- Path aliases configured in tsconfig.json

## Naming Conventions for Theme Registry

- Kebab-case or lowercase (e.g., `"hero"`, `"feature"`, `"example-ref"`)
- Normalized to lowercase internally by platform
- Must be consistent across `sectionsComponents`, `sectionSettingsSchemas`, `blocksComponents`, `blockSettingsSchemas`, `sectionBlocksConfig`
- camelCase (becomes prop name on component, e.g., `id: "heroImage"` → `props.heroImage`)
- Semantically meaningful (e.g., `primaryCtaLabel`, `textAlignment`, `entry`)

## Styling Conventions

- Tailwind CSS v4 with `@tailwindcss/vite` plugin
- Design tokens (colors, radii) defined as CSS custom properties in `:root`
- OKLCH color space for tokens (e.g., `oklch(0.21 0.006 285.885)`)
- No external fonts (system font stack by default)
- Class variance authority (CVA) used for component variants (e.g., Button)
- `cn()` utility (from `@/lib/utils.ts`) merges and de-dupes Tailwind classes
- Layout helpers defined in `@layer base` (e.g., `.heading-xl`, `.container-padding-x`, `.section-padding-y`)
- Responsive classes for mobile-first design (e.g., `lg:flex-row`, `md:gap-3`)
- `clsx` combines conditional classes
- `tailwind-merge` de-dupes conflicting Tailwind utilities
- Pattern: `cn(buttonVariants({ variant, size, className }))`

<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

## System Overview

```text

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

- **Single IIFE bundle** — All code compiled into one `theme.bundle.js`; React, icons, and utilities externalized to reduce duplication across multiple themes
- **Five-map registry** — Sections and blocks register via consistent maps keyed by kebab-case type strings
- **Props-driven configuration** — Each component receives all setting values as props; no state management
- **Parent-child hierarchy** — Sections call `renderBlocks()` prop to render child blocks; blocks are leaf nodes
- **Build-time constants** — Theme name and version injected from `package.json` to ensure single source of truth

## Layers

- Purpose: Self-register the theme bundle on the platform window global at runtime
- Location: `src/index.ts`
- Contains: IIFE wrapping that executes on load, reads externalized globals (React, cva, clsx, etc.)
- Depends on: The registry maps from `src/registry.ts`
- Used by: The Theta platform (host app); runs during bundle initialization
- Purpose: Export the five immutable maps (sections, blocks, settings, block config) that define what this theme offers
- Location: `src/registry.ts`
- Contains: `sectionsComponents`, `sectionSettingsSchemas`, `blocksComponents`, `blockSettingsSchemas`, `sectionBlocksConfig`
- Depends on: Individual section/block implementations
- Used by: `src/index.ts` for registration; the platform reads these maps to populate the editor
- Purpose: Render page-level layout containers; can have child blocks
- Location: `src/sections/`
- Contains: React components (e.g., Hero, Future, etc.) + their settings schemas
- Depends on: UI primitives, Lucide icons, settings values passed as props
- Used by: Registry layer; the platform renders one section at a time
- Purpose: Render reusable content blocks that nest inside sections
- Location: `src/blocks/`
- Contains: Simple or complex block components (Feature, ExampleRef, etc.) + settings schemas
- Depends on: UI primitives, Lucide icons, settings/reference values passed as props
- Used by: Sections via `renderBlocks()`; can accept complex data (metaobject references)
- Purpose: Shared CSS, UI components, and helper functions
- Location: `src/lib/` (helpers), `src/components/ui/` (UI primitives), `src/index.css` (styles)
- Contains: `cn()` function, Button, AspectRatio, Tailwind CSS theme tokens
- Depends on: CVA, clsx, tailwind-merge (externalized; available as globals)
- Used by: Section and block components for styling and UI

## Data Flow

### Primary Rendering Path (Edit/Publish)

### MetaObject Reference Resolution Path (ExampleRef)

- **None** — components are pure and stateless; all state lives in the platform's editor/customizer
- Settings changes flow down as props; the platform handles undo/redo and save

## Key Abstractions

- Purpose: Define theme capability; platform uses these to populate editor sidebars
- Examples: `sectionsComponents`, `blockSettingsSchemas`
- Pattern: Flat objects keyed by lowercase/kebab-case type strings; keys must match across all five maps
- Purpose: Declare what editor inputs a component accepts and how to render them
- Examples: `{ id: "title", label: "Heading", type: "text", default: "..." }`
- Pattern: Array of setting objects; each `id` becomes a component prop; type determines editor widget
- Purpose: Page-level layout that may render child blocks
- Examples: Hero section with feature list
- Pattern: Receives `renderBlocks` prop; sections are the only components that render children
- Purpose: Reusable content unit inside a section; no children
- Examples: Feature list item, testimonial, image card
- Pattern: Pure components; all data from props (settings or metaobject reference)
- Purpose: Avoid bundling React, icons, styling libraries; reduce theme bundle size and conflicts
- Examples: `React`, `LucideReact`, `cva`, `clsx`, `twMerge`
- Pattern: Declared in `vite.config.ts` `external`/`output.globals`; shimmed by test harness; injected by platform at runtime

## Entry Points

- Location: `src/index.ts`
- Triggers: IIFE runs automatically when the bundle is loaded in the browser
- Responsibilities: 
- Location: `src/sections/Hero/Hero.tsx`
- Triggers: Platform instantiates the section when rendering a page
- Responsibilities:
- Location: `src/blocks/Feature/Feature.tsx`
- Triggers: Section calls `renderBlocks()` or platform renders standalone block
- Responsibilities:

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

### Bundling Externalized Dependencies

### Adding State to Components

### Not Handling MetaObject Reference Edge Cases

### Importing Sections/Blocks into Each Other

## Error Handling

- **Missing images** — Hero renders a neutral gray placeholder with "Add a hero image" text (`src/sections/Hero/Hero.tsx:84-88`)
- **Unresolved metaobject references** — ExampleRefBlock renders a placeholder card with empty state (`src/blocks/ExampleRef/ExampleRef.tsx:38-50`)
- **Falsy settings** — Components check for presence (e.g., `primaryCtaLabel &&`) before rendering optional elements
- **No validation errors** — Settings validation happens in the platform; the theme receives validated/default values only

## Cross-Cutting Concerns

- Approach: Tailwind CSS v4 with `@theme inline` token mapping; all colors/utilities read from CSS variables in `:root`
- Application: Import `src/index.css` once at bundle entry; styles apply globally to all components
- Customization: Rebrand by editing OKLCH color values in `:root` (see `src/index.css`)
- Approach: None built-in. All text is set via settings values; platform may provide i18n wrapper.
- Pattern: Settings can include translated text; components render as-is
- Approach: Semantic HTML, ARIA labels, focus management via CVA-generated styles
- Pattern: Sections/blocks render `aria-labelledby`, `alt` attributes, focus rings inherited from CVA button variants
- Approach: Lucide React externalized; import from `lucide-react` global
- Pattern: `import { ArrowRight } from "lucide-react"` (already shown in `src/sections/Hero/Hero.tsx:4`)

<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
