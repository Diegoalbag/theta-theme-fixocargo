import { notFound } from "next/navigation";
import { fetchPages, fetchPageBySlug, fetchSite } from "@/lib/strapi-client";
import { PageRenderer } from "@/lib/page-renderer";
import { resolveLiveBundle } from "@/lib/live-resolve";

/** Always fetch fresh data from Strapi so customizer changes are reflected immediately */
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Generate static params for all pages at build time
 */
export async function generateStaticParams() {
  try {
    const pages = await fetchPages();
    return pages.map((page) => ({
      slug: page.slug,
    }));
  } catch (error) {
    console.error("Failed to generate static params:", error);
    return [];
  }
}

/**
 * Generate metadata for the page
 */
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const page = await fetchPageBySlug(slug);

  if (!page) {
    return {
      title: "Page Not Found",
    };
  }

  return {
    title: page.title,
  };
}

/**
 * Page component that renders a single page
 */
export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const page = await fetchPageBySlug(slug);

  if (!page || !page.publishedAt) {
    notFound();
  }

  // Resolve the bundle at REQUEST TIME from Site.liveTheme (Finding 4 / Q3): the
  // page is already dynamic = "force-dynamic", so switching Site.liveTheme to a
  // DIFFERENT theme swaps the loaded bundle with NO redeploy. The env vars remain
  // the fallback (migration window / single-theme tenant). `themeName` is the live
  // theme's registration name (the __THETA_THEMES__ key), not the slug.
  const site = await fetchSite();
  const { themeBundleUrl, themeName } = resolveLiveBundle(site, process.env);
  // Theme CSS: explicit env or derived from the RESOLVED bundle URL (.js → .css)
  const themeCssUrl =
    process.env.NEXT_PUBLIC_THEME_CSS_URL ||
    (themeBundleUrl ? themeBundleUrl.replace(/\.js$/i, ".css") : undefined);

  if (!themeBundleUrl || themeBundleUrl.trim() === '') {
    // Log detailed debugging info
    console.error('Theme bundle URL configuration error:', {
      themeBundleUrl: themeBundleUrl || '(empty)',
      themeName,
      hasStrapiUrl: !!process.env.NEXT_PUBLIC_STRAPI_URL,
      hasStrapiToken: !!process.env.NEXT_PUBLIC_STRAPI_TOKEN,
      nodeEnv: process.env.NODE_ENV,
      allNextPublicVars: Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC_'))
    });

    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4 p-8 max-w-2xl">
          <p className="text-lg font-semibold text-destructive">Configuration Error</p>
          <p className="text-sm text-muted-foreground">
            Theme bundle URL is not configured
          </p>
          <div className="text-xs text-muted-foreground mt-4 space-y-2 text-left bg-muted p-4 rounded">
            <p className="font-semibold">Debug Information:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Theme Bundle URL: {themeBundleUrl || '(empty)'}</li>
              <li>Theme Name: {themeName}</li>
              <li>Strapi URL configured: {process.env.NEXT_PUBLIC_STRAPI_URL ? 'Yes' : 'No'}</li>
              <li>Environment: {process.env.NODE_ENV || 'unknown'}</li>
            </ul>
            <p className="font-semibold mt-4">Possible causes:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>The theme bundle was not built before deployment</li>
              <li>The THEME_BUNDLE_URL secret is not set in GitHub</li>
              <li>The bundle file was not found in the build branch</li>
              <li>The environment variable was not set during the GitHub Actions build</li>
            </ul>
            <p className="mt-2">Please check your GitHub Actions workflow logs for the "Determine theme bundle URL" step to see what URL was determined.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PageRenderer
      page={page}
      themeBundleUrl={themeBundleUrl}
      themeName={themeName}
      themeCssUrl={themeCssUrl || undefined}
    />
  );
}
