import { RenderArchive, buildArchiveMetadata } from "../../../_lib/render-blog";

/**
 * `/blog/category/{term}` -- one category archive, page 1 (Phase 22, Plan
 * 06, BLOG-07, D-3). Shares the SAME `archive` template as `/blog` and
 * `/blog/tag/{term}`, differing only by `ArchiveProp.term`.
 *
 * `generateStaticParams` returns an empty array deliberately: category
 * archives render on demand under ISR, and pre-rendering every category at
 * build time is not worth a build-time fan-out.
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

interface CategoryArchivePageProps {
  params: Promise<{ term: string }>;
}

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: CategoryArchivePageProps) {
  const { term } = await params;
  return buildArchiveMetadata({ kind: "category", termSlug: term, page: 1 });
}

export default async function BlogCategoryArchivePage({ params }: CategoryArchivePageProps) {
  const { term } = await params;
  return <RenderArchive kind="category" termSlug={term} page={1} />;
}
