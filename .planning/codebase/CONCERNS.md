# Codebase Concerns

**Analysis Date:** 2026-06-23

## Type Safety Issues

### Missing Type Annotations on Global Window Access

**What happens:** In `src/index.ts`, the theme bundle registers itself on `window.__THETA_THEMES__` using `(window as any)` type casts to suppress TypeScript errors.

**Files:** `src/index.ts` (lines 19-20)

**Impact:** This bypasses TypeScript's type safety and prevents compile-time detection of registration issues. If the registration property name or structure changes in the platform, errors won't be caught until runtime.

**Fix approach:** Create a type declaration file or interface that properly types the global `__THETA_THEMES__` namespace. Declare it in a `.d.ts` file or use `declare global` in a setup file, then remove the `as any` casts.

### @ts-ignore in Button Component

**What happens:** The Button component uses `// @ts-ignore` to suppress a TypeScript error when importing Radix UI's `Slot` component.

**Files:** `src/components/ui/button.tsx` (line 2)

**Impact:** This suppresses type checking for the import, potentially masking version mismatches or API changes in the Radix UI library. If the import path or export changes, the error won't surface until runtime.

**Fix approach:** Either properly type the Slot import (check Radix UI's exports and adjust the import) or update the `@radix-ui/react-slot` types if they're missing from the installed version.

## Potential Data Validation Issues

### Unvalidated Image URLs

**What happens:** Image URLs from `heroImage.url` and `entry.image.url` are passed directly to `<img src={...}>` tags without validation.

**Files:**
- `src/sections/Hero/Hero.tsx` (line 80)
- `src/blocks/ExampleRef/ExampleRef.tsx` (line 57)

**Impact:** If the platform sends malformed URLs (empty strings, invalid protocols like `javascript:`, data URIs with malicious content, or extremely long strings), they will be rendered as-is. While browsers block `javascript:` URLs, other attack vectors may exist depending on the content security policy.

**Fix approach:** Add a URL validation utility that checks for safe protocols (`http://`, `https://`) and rejects suspicious patterns. Use the URL constructor or a dedicated library (e.g., `new URL()`) to validate URLs before rendering.

### Missing Alt Text Fallback

**What happens:** In `src/blocks/ExampleRef/ExampleRef.tsx` line 58, the `alt` attribute uses `alt={entry.title}`, which could be empty or undefined if the data object is incomplete.

**Files:** `src/blocks/ExampleRef/ExampleRef.tsx` (line 58)

**Impact:** Empty `alt` attributes can fail accessibility audits and create a poor experience for screen reader users. If `entry.title` is not provided, the alt text will be empty.

**Fix approach:** Provide a fallback alt text like `alt={entry.title || "Linked entry image"}` to ensure all images have meaningful descriptions.

## Block Configuration Alignment Risk

### Section-Block Registry Key Consistency

**What happens:** The `sectionBlocksConfig` in `src/registry.ts` references blocks using type keys like `"@theme"` and `"feature"`, but these must exactly match the keys in `blocksComponents` and `blockSettingsSchemas`. There's no automated validation that keys stay in sync across all four registry maps.

**Files:** `src/registry.ts` (lines 56-80)

**Impact:** If a developer adds a new block to `blocksComponents` but forgets to add it to `blockSettingsSchemas` or `sectionBlocksConfig`, the block will fail to load or render incorrectly. The mismatch won't be detected until runtime in the editor.

**Fix approach:** Add a runtime validation check in tests or in `index.ts` that compares keys across all maps and throws an error if they diverge. Alternatively, create a type-safe registry builder that enforces consistency at build time.

## Testing Coverage Gaps

### Component Unit Tests Missing

**What happens:** The codebase has only registration contract tests (`test/registration-contract.test.ts` and `test/contract-hardfail.test.ts`). There are no unit or integration tests for the Hero section, Feature block, or ExampleRef block components.

**Files:** All component files lack corresponding `.test.tsx` files

**Impact:** Component rendering bugs, prop handling errors, or CSS class application issues won't be caught until the editor loads the theme. Regressions in component behavior can slip through undetected.

**Fix approach:** Add test files for each component:
- `src/sections/Hero/Hero.test.tsx` - test rendering, alignment logic, image fallback, URL handling
- `src/blocks/Feature/Feature.test.tsx` - test default text and icon rendering
- `src/blocks/ExampleRef/ExampleRef.test.tsx` - test placeholder rendering for missing/string/empty data cases

### Missing Responsive Design Tests

**What happens:** The Hero component has responsive class names and layout logic (e.g., `lg:flex-row`, `lg:gap-16`), but these are never tested. CSS media queries and Tailwind responsive utilities are not validated.

**Files:** `src/sections/Hero/Hero.tsx` (responsive classes throughout)

**Impact:** Responsive breakpoints may not work as intended on mobile/tablet/desktop. Design regressions won't be visible without manual browser testing at each breakpoint.

**Fix approach:** Add visual regression tests using a tool like `@storybook/addon-storyshots` or `percy`, or at minimum add tests that verify responsive class names are applied correctly based on viewport changes simulated in jsdom.

## Dependency Risks

### Pinned External Dependencies Risk

**What happens:** The `package.json` lists peer dependencies with caret ranges (e.g., `"react": "^19"`), but the bundled dependencies like `@tailwindcss/vite` and `tailwindcss` are pinned to exact versions (e.g., `^4.1.17`).

**Files:** `package.json` (lines 18-34)

**Impact:** If React 20 is released with breaking changes, the peer constraint allows it. Conversely, the exact pinning of Tailwind CSS means any minor version upgrade could introduce unexpected style changes or build failures.

**Fix approach:** Review peer dependency ranges to ensure they're intentional. Consider using "loose" pinning (e.g., `^19.0.0`) or strict pinning (e.g., `19.0.0`) consistently based on your stability requirements. Document the version compatibility matrix.

## Build Configuration Gaps

### No Security Content Policy Validation

**What happens:** The Vite build config does not include CSP headers or nonce validation for inline scripts. The IIFE bundle is loaded and executed without explicit security headers.

**Files:** `vite.config.ts`

**Impact:** The theme bundle executes with the platform's CSP context, but there's no validation that it complies with strict CSP policies. If the platform moves to a stricter CSP in the future, the theme may break.

**Fix approach:** Add a CSP compliance check in the build output. Document the minimum CSP requirements the theme expects (e.g., `script-src 'unsafe-inline'`). Consider migrating to ES modules if the platform supports it, to avoid inline script execution.

### Missing Build Output Verification

**What happens:** The build process generates a single `theme.bundle.js` file with CSS inlined via Vite's `cssCodeSplit: false`. There's no validation that the bundle size stays reasonable or that no unintended dependencies were bundled.

**Files:** `vite.config.ts` (lines 37-78)

**Impact:** If a developer accidentally imports a large dependency (e.g., a data manipulation library), it will be bundled and shipped with every theme load, degrading performance. The contract tests only verify registration, not bundle health.

**Fix approach:** Add a build-time bundle analysis step (e.g., using `rollup-plugin-visualizer` or `esbuild-analyze`). Set a maximum bundle size threshold and fail the build if exceeded.

## Global Namespace Pollution

### Window Global Registration

**What happens:** The theme registers itself by mutating the global `window.__THETA_THEMES__` object in `src/index.ts`.

**Files:** `src/index.ts` (lines 19-28)

**Impact:** Multiple theme versions or conflicting theme registrations can overwrite each other silently. If two themes register under the same key, the second one wins without warning.

**Fix approach:** Add validation that checks if a theme is already registered under the same name before overwriting. Log a warning if an override occurs, or throw an error to prevent accidental collisions in development.

## Known Limitations (Not Bugs)

### Limited Metaobject Ref Handling

**What happens:** The `ExampleRefBlock` handles the case where `entry` is a raw documentId string (unresolved in the customizer) or a fully resolved object (on the published site), but only has placeholder rendering for missing data.

**Files:** `src/blocks/ExampleRef/ExampleRef.tsx` (lines 38-50)

**Impact:** If a referenced metaobject is deleted after being linked, the placeholder renders without visual distinction from an optional field. Users may not realize the link is broken.

**Fix approach:** This is intentional defensive design per the CLAUDE.md instructions. Consider adding a subtle visual indicator (e.g., a striped pattern or warning icon) when rendering the placeholder to signal a missing reference.

### No Built-in Internationalization

**What happens:** All text in schema defaults, placeholder text, and component labels are hardcoded in English with no i18n framework.

**Files:** `src/registry.ts`, all component files with `label`, `info`, `placeholder` fields

**Impact:** Themes built with this starter are English-only. Multi-language support requires external tooling or manual localization.

**Fix approach:** This is expected for a starter template. Document that i18n should be added at theme customization time, not in the starter itself.

---

*Concerns audit: 2026-06-23*
