import { RenderPage, buildPageMetadata, resolveHomepageSlug } from "./_lib/render-page";

/**
 * Root route — renders the homepage IN PLACE.
 *
 * This used to `redirect()` to `/{slug}`, which cost a full extra round trip
 * (measured: 1.55s for the 307, then the real page — ~3.0s to first byte for
 * anyone landing on the domain root) and canonicalized the homepage to `/home`
 * rather than `/`, splitting link authority between two URLs for the same
 * content.
 *
 * See app/[slug]/page.tsx for why this is ISR rather than force-dynamic.
 */

// See app/[slug]/page.tsx for why this route explicitly declares the Node.js runtime.
export const runtime = "nodejs";
// MUST STAY SHORT until the empty-prerender bug is fixed. This was briefly
// raised to 300 to cut regeneration load (an uncached render costs ~3.7s), and
// that was WRONG: build-time prerendering currently emits a contentless shell,
// because the tenant cannot fetch its own theme bundle during its own build and
// `evaluateThemeServerSide` fails open. A short window is what silently repairs
// that -- the empty shell is replaced by a real request-time render within
// seconds. At 300 the blank page was served for five minutes after every deploy,
// and a crawler arriving in that window indexes nothing. Verified live
// 2026-08-14: prerendered `/` returned 20 visible characters and zero images,
// while request-rendered pages returned 2.4-4.2k characters and 7-9 images.
// Raise this only once a page that fails theme evaluation is no longer written
// to the prerender cache at all.
export const revalidate = 10;

export async function generateMetadata() {
  return buildPageMetadata(await resolveHomepageSlug());
}

export default async function HomePage() {
  const slug = await resolveHomepageSlug();

  // Deliberately a soft empty state rather than notFound(). `fetchPages` swallows
  // Strapi failures and returns [], so a transient outage during the build is
  // indistinguishable here from a genuinely empty CMS — and a hard 404 baked into
  // the prerendered root would then be served until the next revalidation. This
  // self-heals within the `revalidate` window instead.
  if (!slug) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold">No pages found</p>
          <p className="text-sm text-muted-foreground">
            Please create pages in your CMS
          </p>
        </div>
      </div>
    );
  }

  return <RenderPage slug={slug} />;
}
