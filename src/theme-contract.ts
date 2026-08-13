// Theme-facing article/archive contract (project-theta-fe Phase 21, D-06).
//
// This is a LOCAL MIRROR of the platform's published contract. It is a type-only
// declaration — the platform injects the actual values as props into every
// section of an `article` or `archive` template, not only into the body slot.
//
// The platform's canonical copies live in:
//   project-theta-fe/lib/theme-contract/article-contract.ts          (platform)
//   project-theta-fe/templates/theme-site/lib/article-contract.ts    (theme-site)
// and are guarded against divergence by that repo's mirror-drift test.
//
// ArticleProp is FROZEN at exactly these eleven fields and
// THEME_ARTICLE_CONTRACT_VERSION is 1 (project-theta-fe Phase 22, D-12). A theme
// composes post URLs itself from `slug` — the platform deliberately ships no
// `url`/`href` field, because Phase 22's D-1 fixes the route shapes instead:
//
//   post              /blog/{slug}
//   blog index        /blog                      (page 1 has NO /page/1 form)
//   category archive  /blog/category/{slug}
//   tag archive       /blog/tag/{slug}
//   paginated         {base}/page/{n}   for n >= 2
//
// No field is ever `undefined` when the platform supplies the prop; absent
// values arrive as `null` (or `[]` for lists), so a section can branch on
// presence without optional-chaining every access.

export interface ArticleImageProp {
  url: string;
  width: number | null;
  height: number | null;
}

export interface ArticleTermProp {
  name: string;
  slug: string;
}

export interface ArticleAuthorProp {
  name: string;
}

/** The published single-post shape — exactly eleven fields, contract version 1. */
export interface ArticleProp {
  documentId: string;
  title: string;
  slug: string;
  /** Server-sanitized HTML. The platform's sanitizer (Phase 20) is the ONLY
   * gate — a theme must never re-sanitize, unescape or rewrite it. */
  body: string;
  excerpt: string;
  featuredImage: ArticleImageProp | null;
  category: ArticleTermProp | null;
  tags: ArticleTermProp[];
  author: ArticleAuthorProp | null;
  publishedAt: string | null;
  updatedAt: string | null;
}

/** The term an archive is scoped to. Absent (`null`) on the blog index. */
export interface ArchiveTermProp {
  kind: "category" | "tag";
  name: string;
  slug: string;
  description: string | null;
}

/** The published archive shape — the blog index, a category archive or a tag
 * archive, distinguished only by `term`. */
export interface ArchiveProp {
  posts: ArticleProp[];
  term: ArchiveTermProp | null;
  page: number;
}

/** Reserved template keys the platform resolves off the live theme's manifest. */
export const ARTICLE_TEMPLATE_KEY = "article";
export const ARCHIVE_TEMPLATE_KEY = "archive";

/** Reserved section slot keys. A template declaring the key above MUST list the
 * matching slot below in its `sections` array, or the platform treats the theme
 * as not supporting that surface and degrades with a stated 404. */
export const ARTICLE_BODY_SECTION_KEY = "article-body";
export const ARCHIVE_LIST_SECTION_KEY = "archive-list";

export const THEME_ARTICLE_CONTRACT_VERSION = 1;

/** Compose a post's canonical path from the slug the theme already holds.
 * Encoded and root-relative; an empty slug yields `null` so a caller renders
 * no link rather than an anchor to `/blog/`. */
export function postHref(slug: string | null | undefined): string | null {
  if (!slug) return null;
  return `/blog/${encodeURIComponent(slug)}`;
}

/** Compose a term archive's page-1 path. Page 1 deliberately has no
 * `/page/1` form — that URL redirects, and emitting it would create a second
 * URL for the same content (project-theta-fe Phase 22, D-5). */
export function termHref(term: ArchiveTermProp | null | undefined): string | null {
  if (!term || !term.slug) return null;
  const segment = term.kind === "tag" ? "tag" : "category";
  return `/blog/${segment}/${encodeURIComponent(term.slug)}`;
}
