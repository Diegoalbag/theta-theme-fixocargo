import { RenderArchive, buildArchiveMetadata } from "../../../_lib/render-blog";

/**
 * `/blog/tag/{term}` -- one tag archive, page 1 (Phase 22, Plan 06, BLOG-07,
 * D-3). Shares the SAME `archive` template as `/blog` and
 * `/blog/category/{term}`, differing only by `ArchiveProp.term`.
 *
 * `generateStaticParams` returns an empty array deliberately: tag archives
 * render on demand under ISR, and pre-rendering every tag at build time is
 * not worth a build-time fan-out.
 *
 * Node.js runtime required: same `node:vm` reason as every other blog route.
 */
export const runtime = "nodejs";
// Freshness comes from the /api/revalidate purge-on-save chokepoint (Phase 17),
// not from a short timer. At 10s every uncached render paid the full cold cost
// (~3.7s, of which ~2.7s was CMS reads) and entries lapsed constantly on a
// low-traffic tenant, so a large share of real visitors met the slow path.
export const revalidate = 300;

interface TagArchivePageProps {
  params: Promise<{ term: string }>;
}

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: TagArchivePageProps) {
  const { term } = await params;
  return buildArchiveMetadata({ kind: "tag", termSlug: term, page: 1 });
}

export default async function BlogTagArchivePage({ params }: TagArchivePageProps) {
  const { term } = await params;
  return <RenderArchive kind="tag" termSlug={term} page={1} />;
}
