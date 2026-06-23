# Codebase Structure

**Analysis Date:** 2026-06-23

## Directory Layout

```
theta-theme-starter/
├── .claude/                    # GSD harness & Claude Code config
├── .planning/
│   └── codebase/              # Generated codebase maps (this file)
├── .yarn/                     # Yarn berry cache
├── dist/                      # Build output (theme.bundle.js + theme.bundle.css)
├── public/                    # Static assets (copied to dist/)
├── src/                       # Theme source code
│   ├── blocks/                # Child block components (Feature, ExampleRef, etc.)
│   │   ├── ExampleRef/
│   │   │   ├── ExampleRef.tsx     # Metaobject reference block w/ defensive rendering
│   │   │   └── index.ts            # Barrel export
│   │   └── Feature/
│   │       ├── Feature.tsx         # Feature list item block
│   │       └── index.ts            # Barrel export
│   ├── components/
│   │   └── ui/                     # Reusable UI primitives (Button, AspectRatio)
│   │       ├── aspect-ratio.tsx
│   │       └── button.tsx
│   ├── lib/
│   │   └── utils.ts           # cn() utility function
│   ├── sections/              # Page-level section components (Hero, etc.)
│   │   └── Hero/
│   │       ├── Hero.tsx           # Hero section w/ image, CTA, child blocks
│   │       └── index.ts            # Barrel export
│   ├── index.css              # Tailwind tokens, global styles
│   ├── index.ts               # Bundle entry point; theme registration
│   └── registry.ts            # Theme registry contract (5 maps)
├── test/                      # Test suite
│   ├── contract-assertions.ts
│   ├── contract-hardfail.test.ts
│   └── registration-contract.test.ts    # Build gate; validates bundle registration
├── package.json               # NPM manifest (name = theme ID)
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite build config (IIFE, externals, theme name injection)
├── vitest.config.ts           # Vitest test config
└── yarn.lock                  # Yarn lock file
```

## Directory Purposes

**`src/blocks/`:**
- Purpose: Child block components; reusable content units that nest inside sections
- Contains: React components, settings schemas
- Key files: 
  - `Feature/Feature.tsx` — Simple feature list item with icon
  - `ExampleRef/ExampleRef.tsx` — Defensive metaobject reference with placeholder states
  - Each block has `index.ts` barrel exporting the component and schema

**`src/sections/`:**
- Purpose: Page-level layout containers; the only components that render child blocks
- Contains: React components, settings schemas, block hierarchy config
- Key files:
  - `Hero/Hero.tsx` — Hero banner with title, CTA, image, and child block area
  - Future sections go here (e.g., `Gallery/`, `Testimonials/`, etc.)

**`src/components/ui/`:**
- Purpose: Reusable UI primitives shared across sections and blocks
- Contains: CVA-styled components with variant props
- Key files:
  - `button.tsx` — Button with size/variant options (default, destructive, outline, ghost, link)
  - `aspect-ratio.tsx` — Aspect ratio container for media

**`src/lib/`:**
- Purpose: Utility functions and helpers
- Contains: `cn()` function for safe class merging
- Key files:
  - `utils.ts` — `cn(clsx, twMerge)` for merging Tailwind classes

**`src/index.css`:**
- Purpose: Global Tailwind styles and design tokens
- Contains: `@theme inline` mapping, color palette (OKLCH), typography scales, animations
- Note: Imported once in `src/index.ts`; styles apply to entire bundle

**`test/`:**
- Purpose: Test suite
- Contains: 
  - `registration-contract.test.ts` — Build gate; loads dist/theme.bundle.js in jsdom, verifies registration
  - `contract-assertions.ts` — Shared test helper functions
  - `contract-hardfail.test.ts` — Additional contract checks
- Run: `yarn test` or `yarn test:contract` (latter runs only the registration contract)

## Key File Locations

**Entry Points:**

- `src/index.ts` — **Bundle entry.** Imports registry maps, registers theme on `window.__THETA_THEMES__[themeName]`. This is the single file Vite compiles into `dist/theme.bundle.js`.

- `src/registry.ts` — **Registry contract.** Exports five maps: `sectionsComponents`, `sectionSettingsSchemas`, `blocksComponents`, `blockSettingsSchemas`, `sectionBlocksConfig`. The platform reads these to populate the editor.

**Configuration:**

- `package.json` — Theme name and version (name becomes `__THEME_NAME__` at build time).
- `vite.config.ts` — Build settings: entry point, externals (React, clsx, etc.), library format (IIFE), theme name/version injection.
- `vitest.config.ts` — Test runner config; includes test path alias resolution.
- `tsconfig.json` — TypeScript config with `@/*` alias pointing to `src/`.

**Core Logic:**

- `src/sections/Hero/Hero.tsx` — Hero section component; demonstrates settings, image picker, CTA, `renderBlocks()` call.
- `src/blocks/Feature/Feature.tsx` — Feature block; simple example of a child block.
- `src/blocks/ExampleRef/ExampleRef.tsx` — Metaobject reference block; shows defensive prop handling for resolved/unresolved states.

**Testing:**

- `test/registration-contract.test.ts` — Runs the bundle through jsdom; verifies it registers under the correct theme name.

## Naming Conventions

**Files:**

- **Components:** PascalCase (e.g., `Hero.tsx`, `Feature.tsx`, `Button.tsx`)
- **Utils/helpers:** camelCase (e.g., `utils.ts`)
- **Barrel exports:** `index.ts` (no renaming)
- **Styles:** `index.css` (entry file); no component-scoped stylesheets (Tailwind only)

**Directories:**

- **Feature-based:** `/src/sections/[FeatureName]/`, `/src/blocks/[BlockName]/` (PascalCase, singular)
- **Type-based:** `/src/components/ui/` (lowercase group name)
- **Exports:** Each component dir has `index.ts` barrel

**Component/Type Keys (Registry):**

- kebab-case, lowercase: `"hero"`, `"feature"`, `"example-ref"`
- Keys must match across all five registry maps (`sectionsComponents`, `sectionSettingsSchemas`, etc.)
- Example from `src/registry.ts:17`: `hero: Hero as React.ComponentType<...>`

**Props & Settings:**

- **Setting `id`:** camelCase (e.g., `heroImage`, `primaryCtaLabel`) — becomes the prop name
- **Component props:** camelCase (e.g., `renderBlocks`, `blockId`, `sectionName`)
- **CSS classes:** Tailwind utilities only (no custom class names); merged via `cn()`

## Where to Add New Code

**New Section:**

1. Create directory: `src/sections/[NewName]/`
2. Create component: `src/sections/[NewName]/[NewName].tsx` with:
   - Props interface extending settings schema
   - Component function receiving props + injected props (`sectionId`, `sectionName`, optional `renderBlocks`)
   - Settings schema array (default values, types, labels)
3. Create barrel: `src/sections/[NewName]/index.ts` with `export * from "./[NewName]"`
4. Register in `src/registry.ts`:
   - Add to `sectionsComponents`: `"new-name": NewName as React.ComponentType<...>`
   - Add to `sectionSettingsSchemas`: `"new-name": newNameSettingsSchema`
   - Add to `sectionBlocksConfig`: `"new-name": { blocks: [{ type: "@theme" }], maxBlocks: 10 }`

**New Block:**

1. Create directory: `src/blocks/[NewName]/`
2. Create component: `src/blocks/[NewName]/[NewName].tsx` with:
   - Props interface extending settings schema
   - Component function receiving props + injected props (`blockId`, `blockType`)
   - Settings schema array
3. Create barrel: `src/blocks/[NewName]/index.ts`
4. Register in `src/registry.ts`:
   - Add to `blocksComponents`: `"new-block-name": NewBlock as React.ComponentType<...>`
   - Add to `blockSettingsSchemas`: `"new-block-name": newBlockSettingsSchema`
5. (Optional) Add to `sectionBlocksConfig[sectionKey].blocks` if only certain sections should use it

**New UI Primitive:**

1. Create: `src/components/ui/[component-name].tsx`
2. Define component with CVA variants (like `Button`) or composition (like `AspectRatio`)
3. Export both component and `variantsConfig` (if using CVA)
4. Import in sections/blocks as needed: `import { MyComponent } from "@/components/ui/..."`

**New Utility:**

1. Add function to `src/lib/utils.ts` or create new file `src/lib/[helper-name].ts`
2. Export function
3. Import in components: `import { helperFn } from "@/lib/utils"` or `import { helperFn } from "@/lib/[helper-name]"`

**Styling:**

1. Add Tailwind classes directly in JSX (no scoped stylesheets)
2. Use `cn()` to merge conditional classes: `cn("base-class", condition && "conditional-class")`
3. For design token changes (colors, fonts), edit `:root` CSS variables in `src/index.css`

## Special Directories

**`dist/`:**
- Purpose: Build output
- Generated: Yes (by `yarn build` or `yarn watch`)
- Committed: No (gitignored)
- Contains: `theme.bundle.js` (IIFE bundle), `theme.bundle.css` (compiled Tailwind)

**`public/`:**
- Purpose: Static assets
- Generated: No (hand-managed)
- Committed: Yes
- Note: Contents copied to `dist/` at build time via `copyPublicDir: true`

**`.planning/codebase/`:**
- Purpose: Generated codebase analysis documents (ARCHITECTURE.md, STRUCTURE.md, etc.)
- Generated: By `/gsd-map-codebase` skill
- Committed: Yes (version control for analysis)

**`.claude/`:**
- Purpose: Claude Code & GSD harness configuration
- Generated: Partially (hooks, scripts added by GSD init)
- Committed: Yes (project-specific config)

**`node_modules/`, `.yarn/`:**
- Purpose: Dependencies
- Generated: Yes
- Committed: `.yarn/` committed (Yarn berry cache); `node_modules/` gitignored

---

*Structure analysis: 2026-06-23*
