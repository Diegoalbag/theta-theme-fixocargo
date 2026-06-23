# Technology Stack

**Analysis Date:** 2026-06-23

## Languages

**Primary:**
- TypeScript 5.x - Type-safe development for components, registry, and build configuration

**Secondary:**
- JSX/TSX - React component syntax for sections and blocks
- CSS - Tailwind CSS utility-first styling

## Runtime

**Environment:**
- Node.js (v22+ recommended based on `@types/node` ^22.0.0)

**Package Manager:**
- Yarn (Corepack-managed, v3+)
- Lockfile: `yarn.lock` present

## Frameworks

**Core:**
- React 19.x - UI component framework (peer dependency)
- React DOM 19.x - DOM rendering (peer dependency)

**Styling:**
- Tailwind CSS 4.1.x - Utility-first CSS framework
- @tailwindcss/vite 4.1.x - Vite plugin for Tailwind
- Tailwind Merge 3.4.x - De-duplicate Tailwind utilities in class names

**UI Components:**
- Radix UI React (slot and aspect-ratio) - Unstyled, accessible component primitives
- Lucide React 0.553.x - Icon library used in components (`ArrowRight`, `Check`)

**Build/Dev:**
- Vite 7.2.x - Lightning-fast build tool, configured for IIFE library output
- @vitejs/plugin-react 5.1.x - React Fast Refresh for Vite

## Key Dependencies

**Critical:**
- `class-variance-authority` 0.7.x - Type-safe CSS variant generation for components like Button
- `clsx` 2.1.x - Conditional className utility
- `tw-animate-css` 1.4.x - Tailwind animation utilities

**Infrastructure:**
- `react-jsx-runtime` (via React 19) - JSX transform for automatic runtime imports

## Testing

**Framework:**
- Vitest 4.1.x - Unit/contract testing runner
- JSDOM 29.1.x - DOM simulation for bundle registration tests

## Configuration

**Environment:**
- Build-time substitution: `__THEME_NAME__` and `__THEME_VERSION__` injected from `package.json` via Vite
- No `.env` file used; configuration driven by `package.json` and build flags

**Build:**
- `vite.config.ts` - IIFE library build configuration
  - Entry: `src/index.ts`
  - Output: `dist/theme.bundle.js` (single IIFE bundle)
  - Externals: React, React DOM, CVA, clsx, Tailwind Merge, Lucide React (provided by platform)
  - Path alias: `@` → `src/`
- `tsconfig.json` - TypeScript configuration
  - Target: ES2017
  - Module: ESNext
  - JSX: react-jsx (automatic runtime)
  - Path alias: `@/*` → `src/*`
- `vitest.config.ts` - Test runner configuration
  - Environment: Node.js (not jsdom global)
  - Test files: `test/**/*.test.ts`

## Platform Requirements

**Development:**
- Node.js 22+ (inferred from @types/node)
- Yarn 3+ (Corepack)
- Git (for version control)

**Production:**
- Browser with ES2017+ support
- Platform injects globals: `React`, `ReactDOM`, `jsxRuntime`, `cva`, `clsx`, `twMerge`, `LucideReact` (defined in vite.config.ts externals)
- Theme publishes as single IIFE bundle to `window.__THETA_THEMES__[themeName]`

---

*Stack analysis: 2026-06-23*
