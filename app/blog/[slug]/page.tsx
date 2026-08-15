import { fetchPublishedArticleSlugs } from "@/lib/blog-client";
import { RenderPost, buildPostMetadata } from "../../_lib/render-blog";

/**
 * `/blog/{slug}` -- one published post (Phase 22, Plan 02, BLOG-07/BLOG-08).
 *
 * The Node.js runtime declaration below is required: `node:vm` powers the
 * server-side theme evaluator and does not exist on Edge -- same guard, same
 * reason, as `app/[slug]/page.tsx`
 * (see .planning/phases/12-server-side-theme-evaluation-infrastructure/SSR-07-THREAT-MODEL.md).
 *
 * This static `blog` segment wins route precedence over the sibling
 * `app/[slug]/page.tsx` catch-all by Next.js's static-before-dynamic rule --
 * a client page whose slug is literally `blog` becomes unreachable, a
 * stated D-1 trade (22-CONTEXT.md), not a collision detected at runtime.
 */
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

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

/** D-6: enumerates published posts only. */
export async function generateStaticParams() {
  try {
    const slugs = await fetchPublishedArticleSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch (error) {
    console.error("Failed to generate static params for blog posts:", error);
    return [];
  }
}

export async function generateMetadata({ params }: PostPageProps) {
  const { slug } = await params;
  return buildPostMetadata(slug);
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  return <RenderPost slug={slug} />;
}
