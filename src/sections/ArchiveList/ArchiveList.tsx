import * as React from "react";

import { Card } from "@/components/ui/card";
import { ImageGuard } from "@/lib/image-guard";
import type { ArchiveProp, ArticleProp } from "@/theme-contract";
import { postHref, termHref } from "@/theme-contract";

// ArchiveList — the reserved `archive-list` slot of the platform's `archive`
// template (project-theta-fe Phase 21, D-06 / Phase 22, D-3).
//
// ONE section serves all three archive surfaces. The blog index, a category
// archive and a tag archive differ only by `archive.term`: absent on the index,
// present with `kind: "category" | "tag"` on a term archive. Branching on that
// one field is the whole difference — there is deliberately no second section
// and no second reserved key.
//
// This is the CONTRACT-DRIVEN counterpart to `blog-list`. `blog-list` stays
// exactly as it was: an authored, block-driven index a merchant arranges by
// hand on an ordinary page. This section renders whatever the platform actually
// published, and is the one the `archive` template seeds.
//
// Every card links with a real anchor composed from the post's own `slug` via
// `postHref` — the platform ships no URL field (Phase 22, D-12), so the theme
// composes it, encoded and root-relative. A post with a blank slug renders as
// unlinked text rather than an anchor to `/blog/`.
//
// Images route through ImageGuard, never a bare <img> (`no-bare-img` gate), so
// a post with no featured image — or one whose media has expired — renders a
// neutral placeholder instead of a broken image or a collapsed card.
//
// Stateless: no useState, no effects, no refs, no event handlers. Renders under
// node renderToStaticMarkup. Brand tokens only — no hex literals. @/ imports only.
export interface ArchiveListProps {
  /** Platform-injected archive payload. Absent when this section is placed on
   * an ordinary page rather than an `archive` template. */
  archive?: ArchiveProp | null;
  /** Authored heading for the blog index. A TERM archive ignores it and uses
   * the term's own name, which is the truthful label for that page. */
  heading?: string;
  emptyMessage?: string;
  sectionId?: string;
  sectionName?: string;
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return null;
  // Fixed locale/timezone so server and client render identical text — a
  // locale-dependent date is a hydration mismatch waiting to happen.
  return parsed.toLocaleDateString("es-DO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

const PostCard = ({ post }: { post: ArticleProp }): React.ReactNode => {
  const href = postHref(post.slug);
  const date = formatDate(post.publishedAt);

  const inner = (
    <Card variant="surface" className="flex h-full flex-col overflow-hidden p-0">
      <div className="relative">
        <ImageGuard
          url={post.featuredImage?.url}
          alt={post.title}
          ratio={422 / 240}
        />
        {post.category ? (
          <div className="absolute left-4 top-4">
            <span className="rounded-full bg-brand-navy px-3 py-1 font-gotham text-xs font-bold text-white">
              {post.category.name}
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-6">
        {date ? (
          <span className="font-gill text-sm text-muted-foreground">{date}</span>
        ) : null}
        <h3 className="font-gotham text-lg font-bold text-brand-navy">
          {post.title}
        </h3>
        {post.excerpt ? (
          <p className="font-opensans text-sm text-muted-foreground">
            {post.excerpt}
          </p>
        ) : null}
      </div>
    </Card>
  );

  // A blank slug yields no href — render the card unlinked rather than an
  // anchor pointing at the listing itself.
  return href ? (
    <a href={href} className="block h-full">
      {inner}
    </a>
  ) : (
    inner
  );
};

export const ArchiveList = ({
  archive,
  heading,
  emptyMessage = "Todavía no hay artículos publicados.",
}: ArchiveListProps): React.ReactNode => {
  const posts = archive?.posts ?? [];
  const term = archive?.term ?? null;

  // A term archive labels itself with the term's own name; the index uses the
  // authored heading. Never invent a title for a term the platform named.
  const resolvedHeading = term ? term.name : heading;
  const termLink = termHref(term);

  return (
    <section className="bg-transparent section-padding-y">
      <div className="container mx-auto container-padding-x">
        {resolvedHeading ? (
          <h1 className="heading-lg font-gotham text-brand-navy mb-2">
            {resolvedHeading}
          </h1>
        ) : null}

        {term?.description ? (
          <p className="font-opensans text-base text-muted-foreground mb-6 max-w-3xl">
            {term.description}
          </p>
        ) : null}

        {posts.length === 0 ? (
          // A stated empty state — never chrome wrapped around nothing.
          <p className="font-opensans text-base text-muted-foreground">
            {emptyMessage}
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.documentId} post={post} />
            ))}
          </div>
        )}

        {/* On a term archive, a way back to the full index. Page 1 lives only
            at the bare path (Phase 22, D-5) — this never emits /page/1. */}
        {termLink ? (
          <div className="mt-8">
            <a
              href="/blog"
              className="font-gotham text-sm font-bold text-brand-navy underline"
            >
              Ver todos los artículos
            </a>
          </div>
        ) : null}
      </div>
    </section>
  );
};

// Only the index heading and the empty-state copy are authorable. Everything
// else on this section is published content — exposing it as settings would
// invite a merchant to contradict what the platform actually serves.
export const archiveListSettingsSchema = [
  {
    id: "heading",
    label: "Título del blog",
    type: "text",
    default: "Blog",
  },
  {
    id: "emptyMessage",
    label: "Mensaje cuando no hay artículos",
    type: "text",
    default: "Todavía no hay artículos publicados.",
  },
];
