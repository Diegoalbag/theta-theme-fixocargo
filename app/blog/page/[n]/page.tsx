import { notFound, redirect } from "next/navigation";
import { parseBlogPageParam, resolveBlogPaginationPath } from "@/lib/blog-pagination";
import { NOT_FOUND_TITLE } from "@/lib/seo-resolve";
import { RenderArchive, buildArchiveMetadata } from "../../../_lib/render-blog";

/**
 * `/blog/page/{n}` -- the paginated blog index (Phase 22, Plan 06, BLOG-07,
 * D-5).
 *
 * A directory named `page` and a file named `page.tsx` coexist in the
 * PARENT folder (`app/blog/`) by design: `app/blog/page.tsx` serves `/blog`
 * and this file (`app/blog/page/[n]/page.tsx`) serves `/blog/page/{n}` -- it
 * reads like a conflict and is not one.
 *
 * `n=1` redirects to the bare `/blog` path -- D-5's entire mechanism: page 1
 * is served at exactly one URL, so two URLs never render identical content.
 * The redirect destination is always built via `resolveBlogPaginationPath`,
 * never a literal string, and the redirect happens BEFORE any fetch -- there
 * is nothing to read for a URL that is about to be replaced. A non-numeric,
 * zero, negative, padded or absurdly long segment 404s -- never coerced to
 * page 1.
 *
 * Node.js runtime required: same `node:vm` reason as every other blog route.
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

interface PaginatedIndexPageProps {
  params: Promise<{ n: string }>;
}

export async function generateMetadata({ params }: PaginatedIndexPageProps) {
  const { n } = await params;
  const page = parseBlogPageParam(n);
  if (page === null) return { title: NOT_FOUND_TITLE };
  return buildArchiveMetadata({ kind: "index", page });
}

export default async function BlogIndexPaginatedPage({ params }: PaginatedIndexPageProps) {
  const { n } = await params;
  const page = parseBlogPageParam(n);
  if (page === null) notFound();
  if (page === 1) redirect(resolveBlogPaginationPath("index", null, 1));
  return <RenderArchive kind="index" page={page} />;
}
