import { notFound, redirect } from "next/navigation";
import { parseBlogPageParam, resolveBlogPaginationPath } from "@/lib/blog-pagination";
import { NOT_FOUND_TITLE } from "@/lib/seo-resolve";
import { RenderArchive, buildArchiveMetadata } from "../../../../../_lib/render-blog";

/**
 * `/blog/tag/{term}/page/{n}` -- the paginated tag archive (Phase 22, Plan
 * 06, BLOG-07, D-3/D-5).
 *
 * A directory named `page` and a file named `page.tsx` coexist in the
 * PARENT folder (`app/blog/tag/[term]/`) by design -- same reasoning as
 * `app/blog/page/[n]/page.tsx`'s own doc comment.
 *
 * `n=1` redirects to the bare `/blog/tag/{term}` path -- D-5's page-1
 * collapse, built via `resolveBlogPaginationPath`, never a literal string,
 * BEFORE any fetch. A non-numeric, zero, negative, padded or absurdly long
 * segment 404s -- never coerced to page 1.
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

interface TagArchivePaginatedPageProps {
  params: Promise<{ term: string; n: string }>;
}

export async function generateMetadata({ params }: TagArchivePaginatedPageProps) {
  const { term, n } = await params;
  const page = parseBlogPageParam(n);
  if (page === null) return { title: NOT_FOUND_TITLE };
  return buildArchiveMetadata({ kind: "tag", termSlug: term, page });
}

export default async function BlogTagArchivePaginatedPage({
  params,
}: TagArchivePaginatedPageProps) {
  const { term, n } = await params;
  const page = parseBlogPageParam(n);
  if (page === null) notFound();
  if (page === 1) redirect(resolveBlogPaginationPath("tag", term, 1));
  return <RenderArchive kind="tag" termSlug={term} page={page} />;
}
