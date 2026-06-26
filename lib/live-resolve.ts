/**
 * Pure live/preview-divide resolvers for the DEPLOYED per-tenant theme-site.
 *
 * The deployed public site must render STRICTLY through `Site.liveTheme` (D-04,
 * MT-04): only the template BOUND to the current live theme is rendered, and the
 * loaded bundle is the live theme's own bundle. Both resolvers here are PURE
 * (no network, no side effects) so they can be unit-pinned:
 *   - resolvePageForLiveTheme(page, site) → the page narrowed to its liveTheme-bound
 *     template, or null (D-06 missing binding → 404 / D-04 unset liveTheme → nothing).
 *   - resolveLiveBundle(site, env) → { themeBundleUrl, themeName } resolved at
 *     request time from Site.liveTheme.builtAssetUrl/name, env vars as fallback.
 */

/** A theme-binding carried by a template: which theme this template belongs to. */
interface LiveThemeRef {
  documentId: string;
  name?: string | null;
  builtAssetUrl?: string | null;
}

interface LiveSite {
  documentId?: string;
  liveTheme?: LiveThemeRef | null;
}

/**
 * A bound template as returned by the theme-filtered query. Shape is intentionally
 * loose: Strapi may return `theme` as a single object, and `sections` is repeatable.
 */
interface BoundTemplate {
  documentId?: string;
  theme?: { documentId?: string | null } | null;
  sections?: unknown[];
  [key: string]: unknown;
}

/**
 * A theme-agnostic page (one slug) carries an ARRAY of theme-scoped templates
 * (manyToMany, D-14) — but legacy/snake/camel shapes may surface a single object.
 * We accept either `page_template` (snake, the canonical attribute) or
 * `pageTemplate` (camel), and either an array or a single template, mirroring the
 * dashboard precedent `page.page_template ?? page.pageTemplate`.
 */
interface LivePage {
  documentId?: string;
  slug?: string;
  page_template?: unknown;
  pageTemplate?: unknown;
}

/** Coerce the (snake|camel, array|single) page_template into a flat array. */
function templatesOf(page: LivePage): BoundTemplate[] {
  const raw =
    (page?.page_template as BoundTemplate | BoundTemplate[] | null | undefined) ??
    (page?.pageTemplate as BoundTemplate | BoundTemplate[] | null | undefined) ??
    null;
  if (raw == null) return [];
  return Array.isArray(raw) ? raw : [raw];
}

/**
 * D-05: pick the ONE template bound to the current live theme so the SAME slug
 * renders a DIFFERENT template per theme. The JS filter here is AUTHORITATIVE —
 * correctness does NOT depend on Strapi honoring the inline relation filter (A2):
 * even if the query returns templates from other themes, only the liveTheme-bound
 * one is selected.
 *
 * Returns null when:
 *   - site.liveTheme is unset (D-04: nothing renders publicly), or
 *   - no bound template matches the live theme (D-06: missing binding → 404).
 * Otherwise returns the page narrowed so its effective `page_template` is that
 * single bound template (sections preserved).
 */
export function resolvePageForLiveTheme<P extends LivePage>(
  page: P | null | undefined,
  site: LiveSite | null | undefined
): P | null {
  if (!page) return null;
  const liveThemeId = site?.liveTheme?.documentId;
  if (!liveThemeId) return null; // D-04: no live theme → nothing public

  const bound = templatesOf(page).find(
    (tmpl) => tmpl?.theme?.documentId === liveThemeId
  );
  if (!bound) return null; // D-06: missing binding → 404, no cross-theme fallback

  // Narrow the page to the single live-theme-bound template. Normalize to the
  // snake-case attribute the renderer reads, and drop the camel alias so the
  // narrowed shape is unambiguous downstream.
  const { pageTemplate: _drop, ...rest } = page;
  void _drop;
  return {
    ...(rest as P),
    page_template: bound,
  };
}

interface BundleEnv {
  NEXT_PUBLIC_THEME_BUNDLE_URL?: string;
  NEXT_PUBLIC_THEME_NAME?: string;
  [key: string]: string | undefined;
}

interface ResolvedBundle {
  themeBundleUrl: string | undefined;
  themeName: string;
}

/**
 * Finding 4 / Open Q3 (RESOLVED): resolve the public bundle at REQUEST TIME from
 * Site.liveTheme.builtAssetUrl / name so switching Site.liveTheme to a DIFFERENT
 * theme swaps the rendered bundle with NO redeploy. The env vars remain the
 * fallback for the migration window / single-theme tenant.
 *
 * NOTE: `themeName` MUST be the live theme's registration name — the
 * `__THETA_THEMES__` key (THEME-01 canonical Theme.name), NOT the slug. The
 * loader keys the bundle module on this name.
 *
 * Pure: no network, no side effects.
 */
export function resolveLiveBundle(
  site: LiveSite | null | undefined,
  env: BundleEnv | null | undefined
): ResolvedBundle {
  const liveTheme = site?.liveTheme ?? null;
  const e = env ?? {};
  const themeBundleUrl =
    liveTheme?.builtAssetUrl ?? e.NEXT_PUBLIC_THEME_BUNDLE_URL;
  const themeName =
    liveTheme?.name ?? e.NEXT_PUBLIC_THEME_NAME ?? "default";
  return { themeBundleUrl, themeName };
}
