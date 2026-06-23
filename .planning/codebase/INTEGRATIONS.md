# External Integrations

**Analysis Date:** 2026-06-23

## APIs & External Services

**None detected** - This is a frontend theme bundle with no runtime API calls or external service integrations in the starter code.

## Data Storage

**Databases:**
- Not applicable - Theme is purely presentational

**File Storage:**
- Local filesystem only - Image picker and video picker settings are managed by the platform host

**Caching:**
- None - Bundle is loaded once and cached by the browser

## Authentication & Identity

**Auth Provider:**
- Not applicable - Authentication is handled by the platform host

## Monitoring & Observability

**Error Tracking:**
- None detected

**Logs:**
- Not implemented - Components render without logging

## CI/CD & Deployment

**Hosting:**
- Deployed as IIFE bundle (`dist/theme.bundle.js`) to the Theta platform
- Platform loads bundle and injects dependencies as globals

**CI Pipeline:**
- None detected (local yarn build only)
- Build-time contract test: `yarn test:contract` validates bundle registration

## Environment Configuration

**Required env vars:**
- None - Configuration is injected by package.json and Vite build-time substitution

**Secrets location:**
- No secrets management required for this theme bundle

## Webhooks & Callbacks

**Incoming:**
- None - Theme is stateless presentation layer

**Outgoing:**
- Component settings reference external URLs (CTAs link to `primaryCtaUrl`, `secondaryCtaUrl`, etc.) but no API calls

## Platform Contract

**Theme Registration:**
- Theme self-registers on `window.__THETA_THEMES__[themeName]` with:
  - `name`: Theme identifier (from `package.json` name, injected at build time)
  - `version`: Theme version (from `package.json` version)
  - `sectionsComponents`: Map of section type → React component
  - `sectionSettingsSchemas`: Settings UI schema for each section
  - `blocksComponents`: Map of block type → React component (optional)
  - `blockSettingsSchemas`: Settings UI schema for each block (optional)
  - `sectionBlocksConfig`: Block acceptance rules per section (optional)

**Injected Globals (from platform):**
| Global | Module | Usage |
|--------|--------|-------|
| `React` | `react` | Component rendering |
| `ReactDOM` | `react-dom` | DOM mounting (shimmed in tests) |
| `jsxRuntime` | `react/jsx-runtime` | JSX transform |
| `cva` | `class-variance-authority` | Button variants |
| `clsx` | `clsx` | Conditional class names |
| `twMerge` | `tailwind-merge` | Tailwind utility de-duplication |
| `LucideReact` | `lucide-react` | Icon rendering |
| `cn` | Platform lib/utils | Optional — local copy in `src/lib/utils.ts` |

---

*Integration audit: 2026-06-23*
