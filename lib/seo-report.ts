/**
 * Structured degrade channel for the SEO/metadata subsystem (Phase 14).
 *
 * Deliberately a SEPARATE module from `theme-evaluator.ts`'s reporting seam:
 * `app/robots.ts` and `app/sitemap.ts` (Plan 04) would otherwise have to
 * import the theme evaluator, which pulls in `node:vm`, the SSR React
 * runtime and `lucide-react` into a route that emits four lines of text.
 *
 * Reproduces `theme-evaluator.ts`'s `reportEvaluationFailure` structure
 * exactly: the `console.error` record is unconditional and always-on,
 * independent of Sentry availability or DSN configuration; the Sentry call
 * is wrapped in its own swallowing try/catch so a telemetry failure can
 * never turn a graceful degrade into a throw (extends the theme-evaluator's
 * D-09/D-07 pattern to this subsystem).
 *
 * `context` NEVER carries CMS field values, the resolved Strapi token, the
 * bundle text, or any request header — only booleans and short identifiers
 * describing which inputs were present (extends T-12-09 to this subsystem,
 * T-14-08).
 */

import * as Sentry from "@sentry/nextjs";

/**
 * The degrade reasons this phase produces.
 *
 * - `origin-unresolvable` — no tenant origin could be resolved, so every
 *   absolute URL is omitted rather than guessed (D-07).
 * - `site-read-threw` — `fetchSite()` threw despite its documented
 *   never-throws contract (it traps internally and returns `null`). The root
 *   layout keeps a defensive trap because a throw there takes every route in
 *   the template down (T-14-12); if that trap ever fires, the contract has
 *   been broken and it must be visible rather than inferred from a silently
 *   defaulted `<html lang>`.
 */
export type SeoDegradeReason = "origin-unresolvable" | "site-read-threw";

/** The four consumers of this channel (Plans 02-04). */
export type SeoSurface = "page-metadata" | "root-layout" | "sitemap" | "robots";

/**
 * The one and only reporting seam in this module. `context` is constrained
 * to primitive values so a caller cannot hand it an object graph that might
 * carry a CMS field value, a token, or a request header.
 */
export function reportSeoDegrade(
  reason: SeoDegradeReason,
  surface: SeoSurface,
  context?: Record<string, string | number | boolean>
): void {
  console.error("[seo-metadata]", reason, surface, context ?? {});

  try {
    Sentry.captureException(new Error(`[seo-metadata] ${reason}`), {
      tags: { subsystem: "seo-metadata", reason, surface },
      extra: context,
    });
  } catch {
    // Swallow: see the module doc comment above. The console.error above
    // already recorded this failure regardless of what happens here.
  }
}
