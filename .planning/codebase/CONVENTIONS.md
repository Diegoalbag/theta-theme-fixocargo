# Coding Conventions

**Analysis Date:** 2026-06-23

## Naming Patterns

**Files:**
- React components: PascalCase (e.g., `Hero.tsx`, `FeatureBlock.tsx`, `Button.tsx`)
- Non-component files: camelCase (e.g., `registry.ts`, `utils.ts`, `contract-assertions.ts`)
- Index files: `index.ts` for barrel exports
- Settings schemas: camelCase with "SettingsSchema" suffix (e.g., `heroSettingsSchema`, `featureBlockSettingsSchema`)

**Functions:**
- Components: PascalCase (exported as `export const ComponentName = () => {}`)
- Regular functions: camelCase (e.g., `assertContract`, `hasNoDisplayFields`)
- Private/internal utilities: camelCase, optionally with `_` prefix for truly private module-level functions

**Variables:**
- Constants (records, objects, settings): camelCase (e.g., `alignmentClasses`, `blockSettingsSchemas`)
- React props interfaces: PascalCase with "Props" suffix (e.g., `HeroProps`, `FeatureBlockProps`, `ExampleRefBlockProps`)
- Component instance variables: camelCase (e.g., `textAlignment`, `primaryCtaLabel`)

**Types:**
- Interface names: PascalCase with semantic suffix (e.g., `HeroProps`, `ExampleRefData`, `ExampleRefBlockProps`)
- Type aliases: PascalCase (e.g., `VariantProps<typeof buttonVariants>`)
- Exported data types: Semantically named, PascalCase (e.g., `ExampleRefData`, `SectionSetting`)

## Code Style

**Formatting:**
- No explicit linter/formatter in project — follows TypeScript defaults
- Indentation: 2 spaces (observed in all `.ts`, `.tsx`, `.css` files)
- Line length: typically 80-100 characters (CLAUDE.md comments wrap at ~76 chars)
- Semicolons: Present at end of statements (TypeScript/React convention)

**Imports:**
- Organized by source (node stdlib, external libraries, relative imports)
- Node imports use `import ... from "node:*"` syntax (e.g., `"node:fs"`, `"node:path"`)
- React/JSX imports: `import * as React from "react"` (not default imports) in component files
- Path aliases: `@/*` resolves to `./src/*` (configured in `tsconfig.json` and `vite.config.ts`)

**JSX/TSX:**
- React 19 jsx-runtime (externalized, not bundled)
- Attributes on multiple lines when object spreads occur
- Fragment usage: `<>...</>` for unnamed fragments
- AriaAttributes: Full `aria-*` syntax (e.g., `aria-labelledby="hero-heading"`)

## Import Organization

**Order:**
1. Node standard library (e.g., `import { readFileSync } from "node:fs"`)
2. Third-party libraries (React, Radix UI, class-variance-authority)
3. Relative imports from project (e.g., `@/components`, `@/lib`, `./Hero`)

**Path Aliases:**
- `@/*` → maps to `./src/*`
- Used consistently across components, utilities, and tests
- Never use relative `../../../` paths — always use `@/`

## Error Handling

**Patterns:**
- Defensive guards for optional/nullable values (e.g., checking `entry?.url` before rendering)
- Early-return pattern for invalid states (ExampleRef: `if (!entry || typeof entry === "string" || entry.__missing || hasNoDisplayFields(entry)) { return <placeholder> }`)
- Contract assertions throw with descriptive error messages (see `contract-assertions.ts`)
- `@ts-ignore` comments used sparingly for known type narrowing issues (e.g., Radix UI `Slot`)

**Metaobject_ref Defensive Contract:**
- metaobject references arrive in two forms:
  - **Customizer (preview):** raw documentId `string` or `{}` / `{ __missing: true }`
  - **Published site:** fully resolved object with data fields
- Always render a graceful placeholder for string/missing/empty cases to prevent crashes
- Reference implementation: `src/blocks/ExampleRef/ExampleRef.tsx`

## Logging

**Framework:** `console` (no logging library configured)

**Patterns:**
- Reserved for build-time diagnostics and contract violations
- Runtime logging: minimal (theme bundles execute in browser context where full logging is host responsibility)
- Build diagnostics: console output used for build-time registration verification

## Comments

**When to Comment:**
- Complex business logic or defensive patterns (metaobject refs, contract assertions)
- Architectural decisions (e.g., externalized globals, IIFE design, jsdom test setup)
- Security notes (e.g., ASVS V14 comments in tests about only evaluating local bundles)
- Settings schema documentation (setting types and constraints)

**JSDoc/TSDoc:**
- TypeScript interfaces auto-document through type signatures
- Function parameters documented through typed function signatures and optional props
- Complex type unions use inline comments (e.g., `entry?: ExampleRefData | string`)

## Function Design

**Size:** Small, single-purpose (components render, settings schemas define, utilities assist)

**Parameters:** 
- React components use props object destructuring with interface types
- Utility functions use positional parameters with type annotations
- Optional parameters use `?:` syntax with `??` defaults in component bodies

**Return Values:**
- React components return `React.ReactNode` (JSX elements)
- Settings schemas return arrays of settings objects
- Utilities return typed values (strings, booleans, void for side effects)

## Module Design

**Exports:**
- Index files use barrel exports: `export * from "./ComponentName"`
- Components export both the component (`export const ComponentName = ...`) and props interface (`export interface ComponentNameProps`)
- Settings schemas exported as named constants (e.g., `export const heroSettingsSchema = [...]`)
- Registry maps exported as named constants with explicit type annotations

**Barrel Files:**
- Pattern: `src/sections/[Section]/index.ts` and `src/blocks/[Block]/index.ts`
- Each barrel re-exports the main component file
- Registry imports components from barrel exports, then defines maps

**TypeScript:**
- Target: ES2017
- Module: ESNext
- JSX: react-jsx
- moduleResolution: bundler
- Strict mode: not explicitly set (default behavior)
- Path aliases configured in tsconfig.json

## Naming Conventions for Theme Registry

**Section and Block Type Keys:**
- Kebab-case or lowercase (e.g., `"hero"`, `"feature"`, `"example-ref"`)
- Normalized to lowercase internally by platform
- Must be consistent across `sectionsComponents`, `sectionSettingsSchemas`, `blocksComponents`, `blockSettingsSchemas`, `sectionBlocksConfig`

**Settings Schema IDs:**
- camelCase (becomes prop name on component, e.g., `id: "heroImage"` → `props.heroImage`)
- Semantically meaningful (e.g., `primaryCtaLabel`, `textAlignment`, `entry`)

## Styling Conventions

**CSS Architecture:**
- Tailwind CSS v4 with `@tailwindcss/vite` plugin
- Design tokens (colors, radii) defined as CSS custom properties in `:root`
- OKLCH color space for tokens (e.g., `oklch(0.21 0.006 285.885)`)
- No external fonts (system font stack by default)

**Tailwind Utilities:**
- Class variance authority (CVA) used for component variants (e.g., Button)
- `cn()` utility (from `@/lib/utils.ts`) merges and de-dupes Tailwind classes
- Layout helpers defined in `@layer base` (e.g., `.heading-xl`, `.container-padding-x`, `.section-padding-y`)
- Responsive classes for mobile-first design (e.g., `lg:flex-row`, `md:gap-3`)

**Class Merging:**
- `clsx` combines conditional classes
- `tailwind-merge` de-dupes conflicting Tailwind utilities
- Pattern: `cn(buttonVariants({ variant, size, className }))`

---

*Convention analysis: 2026-06-23*
