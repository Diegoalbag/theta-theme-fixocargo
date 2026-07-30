/**
 * Shared page rendering for the two routes that render CMS pages:
 * `/` (the homepage) and `/[slug]` (everything else).
 *
 * Both routes used to be separate, and `/` only issued a 307 to `/{slug}` —
 * which cost a full extra round trip (measured ~1.5s) and canonicalized the
 * homepage to `/home` instead of `/`. Rendering the homepage in place means the
 * two routes must produce identical output, so the rendering lives here rather
 * than being duplicated.
 *
 * Underscore-prefixed folder: `app/_lib` is a private folder, excluded from
 * routing by Next.js.
 */

import { notFound } from "next/navigation";
import { fetchPages, fetchPageBySlug, fetchSite } from "@/lib/strapi-client";
import type { StrapiPage } from "@/lib/strapi-client";
import { PageRenderer } from "@/lib/page-renderer";
import { resolveLiveBundle } from "@/lib/live-resolve";
import { extractFirstHeroImageUrl } from "@/lib/hero-preload";
import { evaluateThemeServerSide } from "@/lib/theme-evaluator";
import { buildShellHtml, isSsrShellDisabled } from "@/lib/server-shell";

/**
 * Resolve which page is the homepage: the `isHomepage` flag, then the
 * conventional slugs, then the first page. Mirrors the resolution the old
 * `app/page.tsx` redirect performed.
 */
export async function resolveHomepageSlug(): Promise<string | null> {
  const pages = await fetchPages();
  const homepage =
    pages.find((p) => p.isHomepage) ||
    pages.find((p) => ["home", "homepage", "index"].includes(p.slug));
  return homepage?.slug ?? pages[0]?.slug ?? null;
}

/** Metadata shared by both routes. */
export async function buildPageMetadata(slug: string | null) {
  if (!slug) return { title: "Page Not Found" };
  const page = await fetchPageBySlug(slug);
  if (!page) return { title: "Page Not Found" };
  return { title: page.title };
}

function ConfigurationError({
  themeBundleUrl,
  themeName,
}: {
  themeBundleUrl: string | null | undefined;
  themeName: string | undefined;
}) {
  console.error("Theme bundle URL configuration error:", {
    themeBundleUrl: themeBundleUrl || "(empty)",
    themeName,
    hasStrapiUrl: !!process.env.NEXT_PUBLIC_STRAPI_URL,
    hasStrapiToken: !!process.env.NEXT_PUBLIC_STRAPI_TOKEN,
    nodeEnv: process.env.NODE_ENV,
    allNextPublicVars: Object.keys(process.env).filter((k) =>
      k.startsWith("NEXT_PUBLIC_")
    ),
  });

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4 p-8 max-w-2xl">
        <p className="text-lg font-semibold text-destructive">
          Configuration Error
        </p>
        <p className="text-sm text-muted-foreground">
          Theme bundle URL is not configured
        </p>
        <div className="text-xs text-muted-foreground mt-4 space-y-2 text-left bg-muted p-4 rounded">
          <p className="font-semibold">Debug Information:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Theme Bundle URL: {themeBundleUrl || "(empty)"}</li>
            <li>Theme Name: {themeName}</li>
            <li>
              Strapi URL configured:{" "}
              {process.env.NEXT_PUBLIC_STRAPI_URL ? "Yes" : "No"}
            </li>
            <li>Environment: {process.env.NODE_ENV || "unknown"}</li>
          </ul>
          <p className="font-semibold mt-4">Possible causes:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>The theme bundle was not built before deployment</li>
            <li>The THEME_BUNDLE_URL secret is not set in GitHub</li>
            <li>The bundle file was not found in the build branch</li>
            <li>
              The environment variable was not set during the GitHub Actions
              build
            </li>
          </ul>
          <p className="mt-2">
            Please check your GitHub Actions workflow logs for the &quot;Determine
            theme bundle URL&quot; step to see what URL was determined.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Render a CMS page by slug. `notFound()` when the page is missing or unpublished.
 */
export async function RenderPage({ slug }: { slug: string | null }) {
  if (!slug) notFound();

  // The page and the site are independent reads — fetching them concurrently
  // removes one Strapi round trip from the critical path. Previously these were
  // sequential (`await` page, then `await` site) which serialized two Railway
  // round trips. Both are wrapped in React `cache()`, so the duplicate call from
  // generateMetadata still costs nothing.
  const [page, site]: [StrapiPage | null, Awaited<ReturnType<typeof fetchSite>>] =
    await Promise.all([fetchPageBySlug(slug), fetchSite()]);

  if (!page || !page.publishedAt) {
    notFound();
  }

  // Resolve the hero section's background image URL (D-04) so we can emit a
  // server-rendered high-priority preload hint BEFORE the theme bundle is even
  // requested — the LCP candidate is never in this page's HTML otherwise, since
  // PageRenderer is a client component that paints a blank placeholder until the
  // bundle downloads/executes (lcp-discovery-insight). `null` when the page has
  // no hero image; renders unchanged in that case.
  const heroImageUrl = extractFirstHeroImageUrl(page);

  // Resolve the bundle from Site.liveTheme (Finding 4 / Q3) so switching
  // Site.liveTheme to a DIFFERENT theme swaps the loaded bundle with NO
  // redeploy. The env vars remain the fallback (migration window / single-theme
  // tenant). `themeName` is the live theme's registration name (the
  // __THETA_THEMES__ key), not the slug.
  //
  // NOTE: this route is now ISR-cached rather than force-dynamic, so a
  // liveTheme switch takes effect on the next revalidation — the platform
  // should call /api/revalidate after changing it (see app/api/revalidate).
  const { themeBundleUrl, themeName, themeCssDeferredUrl } = resolveLiveBundle(
    site,
    process.env
  );
  const themeCssUrl =
    process.env.NEXT_PUBLIC_THEME_CSS_URL ||
    (themeBundleUrl ? themeBundleUrl.replace(/\.js$/i, ".css") : undefined);

  if (!themeBundleUrl || themeBundleUrl.trim() === "") {
    return (
      <ConfigurationError themeBundleUrl={themeBundleUrl} themeName={themeName} />
    );
  }

  // Phase 13 (SSR-01/SSR-04, D-01/D-04): server-render the page's real
  // section markup into an opaque shell string, so a crawler that executes
  // no JavaScript reads real content instead of PageRenderer's blank
  // placeholder. `shellHtml` stays `undefined` -- never an empty string --
  // whenever there is no server shell to hand off, which reproduces today's
  // exact client-only behavior byte-for-byte. That single `undefined` state
  // covers three cases at once: the kill switch is set (this section), the
  // evaluator returned null (SSR-04, Phase 12's degrade-and-record contract),
  // or every section failed to resolve/render (buildShellHtml's own null).
  let shellHtml: string | undefined;
  if (!isSsrShellDisabled(process.env)) {
    // The kill switch gates the evaluator CALL itself, not merely its
    // result -- a tenant with THETA_DISABLE_SSR_SHELL set pays nothing for
    // server evaluation (D-04).
    const themeModule = await evaluateThemeServerSide(themeBundleUrl, themeName);
    if (themeModule) {
      shellHtml = buildShellHtml({ page, themeModule, themeName }) ?? undefined;
    }
    // A null themeModule means evaluateThemeServerSide already degraded and
    // reported through its own reportEvaluationFailure seam (Phase 12,
    // D-07) -- no new failure plumbing needed here for that case.
  }

  return (
    <>
      {/*
        The hero preload link stays unconditional even though the hero is
        now (usually) also in shellHtml's server HTML. This link is emitted
        in <head>, ahead of the shell body, so it still reaches the browser's
        preload scanner earlier than the body markup does. Considered
        conditioning it on `shellHtml == null`, but removing it would be an
        unmeasured LCP risk for zero benefit -- performance tuning is
        Phase 17's scope -- so it is kept exactly as it was.
      */}
      {heroImageUrl && (
        <link
          rel="preload"
          as="image"
          href={heroImageUrl}
          fetchPriority="high"
        />
      )}
      <PageRenderer
        page={page}
        themeBundleUrl={themeBundleUrl}
        themeName={themeName}
        themeCssUrl={themeCssUrl || undefined}
        themeCssDeferredUrl={themeCssDeferredUrl}
        shellHtml={shellHtml}
      />
    </>
  );
}
