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
// Freshness comes from the /api/revalidate purge-on-save chokepoint (Phase 17),
// not from a short timer. At 10s every uncached render paid the full cold cost
// (~3.7s, of which ~2.7s was CMS reads) and entries lapsed constantly on a
// low-traffic tenant, so a large share of real visitors met the slow path.
export const revalidate = 300;

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
