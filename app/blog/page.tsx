import { RenderArchive, buildArchiveMetadata } from "../_lib/render-blog";

/**
 * `/blog` -- the blog index, page 1 (Phase 22, Plan 06, BLOG-07, D-1/D-3).
 *
 * The Node.js runtime declaration below is required: `node:vm` powers the
 * server-side theme evaluator and does not exist on Edge -- same guard, same
 * reason, as `app/blog/[slug]/page.tsx` and `app/[slug]/page.tsx`
 * (see .planning/phases/12-server-side-theme-evaluation-infrastructure/SSR-07-THREAT-MODEL.md).
 *
 * A directory named `page` and a file named `page.tsx` coexist in this same
 * folder by design, not by accident: THIS file serves `/blog`, and
 * `app/blog/page/[n]/page.tsx` (the sibling `page/` directory) serves
 * `/blog/page/{n}` -- it reads like a conflict and is not one.
 */
export const runtime = "nodejs";
// Freshness comes from the /api/revalidate purge-on-save chokepoint (Phase 17),
// not from a short timer. At 10s every uncached render paid the full cold cost
// (~3.7s, of which ~2.7s was CMS reads) and entries lapsed constantly on a
// low-traffic tenant, so a large share of real visitors met the slow path.
export const revalidate = 300;

export async function generateMetadata() {
  return buildArchiveMetadata({ kind: "index", page: 1 });
}

export default async function BlogIndexPage() {
  return <RenderArchive kind="index" page={1} />;
}
