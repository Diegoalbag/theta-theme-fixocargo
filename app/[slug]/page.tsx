import { fetchPages } from "@/lib/strapi-client";
import { RenderPage, buildPageMetadata } from "../_lib/render-page";

/**
 * ISR rather than `force-dynamic`.
 *
 * This route used to be `export const dynamic = "force-dynamic"`, which meant
 * every visit paid a live Strapi (Railway) round trip before a single byte of
 * content was sent — measured at ~1.5-1.9s TTFB in production. Nothing else on
 * the critical path came close.
 *
 * Freshness is preserved two ways:
 *   1. `revalidate` below is a time-based backstop.
 *   2. `POST /api/revalidate` lets the platform purge a path on demand, so
 *      customizer saves/publishes still show up immediately rather than waiting
 *      out the window.
 *
 * The window is deliberately SHORT. ISR is stale-while-revalidate: an expired
 * entry is still served immediately and regenerated in the background, so the
 * value does not trade visitor latency against freshness — a longer window buys
 * fewer background regenerations, not faster responses. A short window therefore
 * costs essentially nothing and keeps the customizer's save -> preview loop
 * tight until the on-demand hook above is wired up.
 */
export const revalidate = 10;

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Generate static params for all pages at build time.
 * Now meaningful: `force-dynamic` previously overrode this, so it was dead code.
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

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  return buildPageMetadata(slug);
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return <RenderPage slug={slug} />;
}
