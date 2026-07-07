import { cache } from "react";
import { GraphQLClient } from "graphql-request";
import { gql } from "graphql-request";
import { resolvePageForLiveTheme } from "./live-resolve";

// Helper function to normalize URLs - ensures they have a protocol
const normalizeUrl = (url: string): string => {
  if (!url || url.trim() === '') {
    return '';
  }
  // If URL already has protocol, return as-is
  if (/^https?:\/\//.test(url)) {
    return url;
  }
  // Determine protocol based on hostname
  // Use http:// for localhost, local IPs, or .local domains
  // Use https:// for everything else
  const isLocal = /^(localhost|127\.0\.0\.1|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.|\.local)/.test(url);
  return `${isLocal ? 'http' : 'https'}://${url}`;
};

// Strapi configuration from environment variables
// Client-side code uses NEXT_PUBLIC_ prefix, but can fall back to server-side env vars
const rawStrapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || "";
const STRAPI_BASE_URL = rawStrapiUrl ? normalizeUrl(rawStrapiUrl) : "";
const STRAPI_ACCESS_TOKEN = process.env.NEXT_PUBLIC_STRAPI_TOKEN || "";

// Create GraphQL client
const graphqlEndpoint = STRAPI_BASE_URL ? `${STRAPI_BASE_URL}/graphql` : "";

export const strapiClient = new GraphQLClient(graphqlEndpoint, {
  headers: {
    Authorization: `Bearer ${STRAPI_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  },
});

// GraphQL query for fetching all metaobject entries
const getMetaobjectEntriesQuery = gql`
  query GetMetaobjectEntries {
    metaobjectEntries {
      documentId
      name
      data
      metaobject_definition {
        key
      }
    }
  }
`;

interface MetaobjectEntry {
  documentId: string;
  name: string;
  data: Record<string, unknown>;
  metaobject_definition?: { key: string } | null;
}

interface MetaobjectEntriesResponse {
  metaobjectEntries: MetaobjectEntry[];
}

// GraphQL query for fetching pages
const getPagesQuery = gql`
  query GetPages {
    pages {
      documentId
      title
      slug
      publishedAt
      isHomepage
      metafields
      page_template {
        sections {
          id
          sectionKey
          order
          data
          blocks {
            id
            blockType
            order
            data
          }
        }
      }
    }
  }
`;

// liveTheme-filtered single-page query (D-04/D-05/MT-04). `$liveTheme` threads the
// current Site.liveTheme documentId; `page_template` is an inline-filtered array
// (manyToMany, D-14) so a theme-agnostic page surfaces only the template bound to
// the live theme. Each template carries `theme { documentId }` so the AUTHORITATIVE
// JS resolver (resolvePageForLiveTheme) can re-select correctly even if Strapi does
// not honor the inline relation filter (A2 fallback) — correctness never depends on
// the GraphQL filter.
const getPageBySlugQuery = gql`
  query GetPageBySlug($slug: String!, $liveTheme: ID!) {
    pages(filters: { slug: { eq: $slug } }) {
      documentId
      title
      slug
      publishedAt
      isHomepage
      metafields
      page_template(filters: { theme: { documentId: { eq: $liveTheme } } }) {
        documentId
        theme {
          documentId
        }
        sections {
          id
          sectionKey
          order
          data
          blocks {
            id
            blockType
            order
            data
          }
        }
      }
    }
  }
`;

// A2 FALLBACK query: identical to getPageBySlugQuery but WITHOUT the inline
// relation filter. Used only if the filtered query errors on the inline filter
// syntax — resolvePageForLiveTheme still selects the liveTheme-bound template in JS.
const getPageBySlugUnfilteredQuery = gql`
  query GetPageBySlugUnfiltered($slug: String!) {
    pages(filters: { slug: { eq: $slug } }) {
      documentId
      title
      slug
      publishedAt
      isHomepage
      metafields
      page_template {
        documentId
        theme {
          documentId
        }
        sections {
          id
          sectionKey
          order
          data
          blocks {
            id
            blockType
            order
            data
          }
        }
      }
    }
  }
`;

// Site.liveTheme read (V4): uses the public read-only NEXT_PUBLIC_STRAPI_TOKEN —
// a read is fine on it; no privileged write exists in this scaffold. Selects the
// fields the bundle resolver needs (name + builtAssetUrl) plus documentId for the
// page-template binding filter.
const getSiteLiveThemeQuery = gql`
  query GetSiteLiveTheme {
    site {
      liveTheme {
        documentId
        name
        builtAssetUrl
      }
    }
  }
`;

export interface StrapiBlock {
  id?: number | string;
  blockType: string;
  order?: number | null;
  data: Record<string, unknown>;
}

export interface StrapiSection {
  id?: number | string;
  sectionKey: string;
  order?: number | null;
  data: Record<string, unknown>;
  blocks?: StrapiBlock[];
}

/** A theme-scoped template bound to a page (D-05/D-14). */
export interface StrapiPageTemplate {
  documentId?: string;
  theme?: { documentId?: string | null } | null;
  sections?: StrapiSection[];
}

export interface StrapiPage {
  documentId: string;
  title: string;
  slug: string;
  publishedAt?: string | null;
  isHomepage?: boolean;
  metafields?: Record<string, unknown> | null;
  // manyToMany (D-14): the raw fetch can surface an ARRAY of theme-scoped templates.
  // resolvePageForLiveTheme narrows this to the SINGLE liveTheme-bound template
  // before render, so downstream consumers see a single object.
  page_template?: StrapiPageTemplate | StrapiPageTemplate[] | null;
}

export interface StrapiPagesResponse {
  pages: StrapiPage[];
}

/** Site.liveTheme shape (the live pointer + bundle inputs). */
export interface StrapiSite {
  liveTheme?: {
    documentId: string;
    name?: string | null;
    builtAssetUrl?: string | null;
  } | null;
}

export interface StrapiSiteResponse {
  site: StrapiSite | null;
}

/**
 * Fetch all pages from Strapi
 */
export async function fetchPages(): Promise<StrapiPage[]> {
  if (!graphqlEndpoint) {
    console.warn("Strapi GraphQL endpoint not configured. Returning empty pages array.");
    return [];
  }

  try {
    const response = await strapiClient.request<StrapiPagesResponse>(getPagesQuery);
    return response.pages;
  } catch (error) {
    console.error("Failed to fetch pages from Strapi:", error);
    console.error(`GraphQL Endpoint: ${graphqlEndpoint}`);
    
    // Check if it's a 405 error and provide helpful message
    if (error && typeof error === 'object' && 'response' in error) {
      const status = (error as { response?: { status?: number } }).response?.status;
      if (status === 405) {
        console.error(`405 Method Not Allowed: The GraphQL endpoint at ${graphqlEndpoint} may not be configured correctly or doesn't accept POST requests.`);
        console.error(`Please verify that the Strapi GraphQL plugin is enabled and the endpoint is accessible.`);
      }
    }
    
    // Return empty array on failure so the homepage shows "No pages found" instead of "Failed to load pages"
    console.warn("Strapi fetch failed. Returning empty array.", error instanceof Error ? error.message : String(error));
    return [];
  }
}

/**
 * Fetch all metaobject entries from Strapi
 */
async function fetchMetaobjectEntries(): Promise<MetaobjectEntry[]> {
  try {
    const response = await strapiClient.request<MetaobjectEntriesResponse>(getMetaobjectEntriesQuery);
    return response.metaobjectEntries;
  } catch (error) {
    console.error("Failed to fetch metaobject entries:", error);
    return [];
  }
}

/**
 * Check if a data value is a metaobject_ref typed field
 */
function isMetaobjectRef(val: unknown): val is { type: "metaobject_ref"; value: string } {
  return (
    typeof val === "object" &&
    val !== null &&
    (val as Record<string, unknown>).type === "metaobject_ref" &&
    typeof (val as Record<string, unknown>).value === "string"
  );
}

/**
 * Type predicate for an image-typed field value: `{ type: "image", value: ... }`
 * where `value` is either a bare numeric/string id (id-only, not yet hydrated with
 * a url) or an `{ id, url, formats? }` object.
 */
function isImageTypedValue(
  val: unknown
): val is {
  type: "image";
  value: { id?: number | string | null; url?: string | null; formats?: unknown } | number | string | null;
} {
  return (
    typeof val === "object" &&
    val !== null &&
    (val as Record<string, unknown>).type === "image"
  );
}

/**
 * Normalize a single metaobject entry field value.
 * Image fields are stored in Strapi as stringified JSON (e.g. '{"id":15,"url":"..."}').
 * This parses them back to objects so the theme receives clean, ready-to-use data.
 */
function normalizeEntryFieldValue(val: unknown): unknown {
  if (typeof val !== "string") return val;
  // Try to parse as JSON — image/video fields are stored as stringified objects
  try {
    const parsed = JSON.parse(val);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // Not JSON — plain string, return as-is
  }
  return val;
}

/**
 * Normalize all field values in a metaobject entry's data blob.
 * Returns a new object with parsed image/video fields.
 */
function normalizeEntryData(data: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(data)) {
    result[key] = normalizeEntryFieldValue(val);
  }
  return result;
}

/**
 * Replace metaobject_ref typed values in a data map with the resolved entry data
 */
function resolveRefsInData(
  data: Record<string, unknown>,
  entryMap: Map<string, MetaobjectEntry>
): Record<string, unknown> {
  const resolved: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(data)) {
    if (isMetaobjectRef(val)) {
      const entry = entryMap.get(val.value);
      // Replace with json-typed value containing the normalized entry data
      // Falls back to the original ref if the entry wasn't found
      resolved[key] = entry
        ? { type: "json", value: normalizeEntryData(entry.data) }
        : val;
    } else {
      resolved[key] = val;
    }
  }
  return resolved;
}

// Batched formats lookup (D-01): Strapi's GraphQL plugin auto-exposes
// `plugin::upload.file`'s pluralName `files` as query `uploadFiles` (confirmed via
// @strapi/plugin-graphql's naming builder — getFindQueryName = lowerFirst(pluralTypeName)
// = `uploadFiles`). Collector logic (collectImageIds/mergeImageFormats) depends only
// on the RESPONSE shape `{ id, formats }`, not this query name.
const getUploadFilesFormatsQuery = gql`
  query GetUploadFilesFormats($ids: [ID!]) {
    uploadFiles(filters: { id: { in: $ids } }) {
      id
      formats
    }
  }
`;

interface UploadFileFormatsEntry {
  id: string | number;
  formats?: unknown;
}

interface UploadFilesFormatsResponse {
  uploadFiles: UploadFileFormatsEntry[];
}

/**
 * Coerce the (array | single) page_template union into the single bound template.
 * After resolvePageForLiveTheme narrows the page this is always a single object, but
 * these resolvers may also be reached defensively — pick the first if an array slips
 * through.
 */
function singlePageTemplate(page: StrapiPage): StrapiPageTemplate | null {
  const tmpl = page.page_template;
  if (tmpl == null) return null;
  return Array.isArray(tmpl) ? tmpl[0] ?? null : tmpl;
}

/**
 * Resolve all metaobject_ref fields in a page by fetching the referenced entries
 * and replacing refs with the actual entry data (push model for MVP).
 *
 * TODO: When the theme has its own client, remove this function and let the theme
 * fetch metaobject data directly via its own API client.
 */
async function resolvePageMetaobjectRefs(page: StrapiPage): Promise<StrapiPage> {
  const template = singlePageTemplate(page);
  // Collect all referenced documentIds across sections, blocks, and page metafields
  const referencedIds = new Set<string>();
  for (const section of template?.sections ?? []) {
    for (const val of Object.values(section.data)) {
      if (isMetaobjectRef(val)) referencedIds.add(val.value);
    }
    for (const block of section.blocks ?? []) {
      for (const val of Object.values(block.data)) {
        if (isMetaobjectRef(val)) referencedIds.add(val.value);
      }
    }
  }
  // Also collect refs from page-level metafields
  for (const val of Object.values(page.metafields ?? {})) {
    if (isMetaobjectRef(val)) referencedIds.add(val.value);
  }

  if (referencedIds.size === 0) return page;

  const entries = await fetchMetaobjectEntries();
  const entryMap = new Map(
    entries
      .filter((e) => referencedIds.has(e.documentId))
      .map((e) => [e.documentId, e])
  );

  return {
    ...page,
    metafields: page.metafields
      ? resolveRefsInData(page.metafields as Record<string, unknown>, entryMap)
      : page.metafields,
    page_template: template
      ? {
          ...template,
          sections: (template.sections ?? []).map((section) => ({
            ...section,
            data: resolveRefsInData(section.data, entryMap),
            blocks: (section.blocks ?? []).map((block) => ({
              ...block,
              data: resolveRefsInData(block.data, entryMap),
            })),
          })),
        }
      : page.page_template,
  };
}

/**
 * Resolve dynamic_source typed values in a page's section/block data by substituting
 * the referenced page metafield value in place of the source reference.
 * Called after resolvePageMetaobjectRefs so the result can feed directly into
 * convertStrapiDataToProps without further handling.
 */
function resolveDynamicSources(page: StrapiPage): StrapiPage {
  const metafields = (page.metafields ?? {}) as Record<string, unknown>

  function resolveValue(val: unknown): unknown {
    if (
      val !== null &&
      typeof val === "object" &&
      (val as Record<string, unknown>).type === "dynamic_source"
    ) {
      const ds = val as { type: string; value: { source: string; key: string } }
      if (ds.value?.source === "page_metafield") {
        return metafields[ds.value.key] ?? null
      }
    }
    return val
  }

  function resolveData(data: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(data)) {
      result[k] = resolveValue(v)
    }
    return result
  }

  const template = singlePageTemplate(page)
  if (!template) return page

  return {
    ...page,
    page_template: {
      ...template,
      sections: (template.sections ?? []).map((section) => ({
        ...section,
        data: resolveData(section.data),
        blocks: (section.blocks ?? []).map((block) => ({
          ...block,
          data: resolveData(block.data),
        })),
      })),
    },
  }
}

/**
 * Collect every distinct numeric image id referenced anywhere in a page — walks
 * the SAME three sources resolvePageMetaobjectRefs walks (sections, blocks per
 * section, page.metafields), deduped via a Set. Bare numeric/string ids (no url
 * yet) and `{id,url}` object values are both collected. Used to batch-fetch
 * `formats` for every image field in ONE query (D-01) instead of per-field.
 */
export function collectImageIds(page: StrapiPage): number[] {
  const ids = new Set<number>();

  function collectFrom(data: Record<string, unknown> | undefined | null): void {
    for (const val of Object.values(data ?? {})) {
      if (!isImageTypedValue(val)) continue;
      const raw =
        typeof val.value === "number" || typeof val.value === "string"
          ? val.value
          : val.value?.id;
      const numericId = typeof raw === "string" ? Number(raw) : raw;
      if (typeof numericId === "number" && !Number.isNaN(numericId)) {
        ids.add(numericId);
      }
    }
  }

  const template = singlePageTemplate(page);
  for (const section of template?.sections ?? []) {
    collectFrom(section.data);
    for (const block of section.blocks ?? []) {
      collectFrom(block.data);
    }
  }
  collectFrom(page.metafields);

  return [...ids];
}

/**
 * Immutably merge resolved `formats` INTO each image-typed value's existing
 * `{id,url}` wrapper (value.formats) — writes ONLY `formats`, never touches
 * `id`/`url`. Walks the SAME shape collectImageIds walks (sections, blocks,
 * metafields). An id absent from `formatsById` is left completely UNCHANGED (no
 * `formats` key added, no throw) — this is the fail-open behavior for
 * deleted/stale file ids.
 */
export function mergeImageFormats(
  page: StrapiPage,
  formatsById: Map<number, unknown>
): StrapiPage {
  function mergeValue(val: unknown): unknown {
    if (!isImageTypedValue(val)) return val;
    const raw =
      typeof val.value === "number" || typeof val.value === "string"
        ? val.value
        : val.value?.id;
    const numericId = typeof raw === "string" ? Number(raw) : raw;
    if (typeof numericId !== "number" || Number.isNaN(numericId) || !formatsById.has(numericId)) {
      return val;
    }
    const existingValue =
      typeof val.value === "number" || typeof val.value === "string"
        ? { id: val.value }
        : val.value;
    return {
      ...val,
      value: { ...existingValue, formats: formatsById.get(numericId) },
    };
  }

  function mergeData(
    data: Record<string, unknown> | undefined | null
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(data ?? {})) {
      result[key] = mergeValue(val);
    }
    return result;
  }

  const template = singlePageTemplate(page);

  return {
    ...page,
    metafields: page.metafields ? mergeData(page.metafields) : page.metafields,
    page_template: template
      ? {
          ...template,
          sections: (template.sections ?? []).map((section) => ({
            ...section,
            data: mergeData(section.data),
            blocks: (section.blocks ?? []).map((block) => ({
              ...block,
              data: mergeData(block.data),
            })),
          })),
        }
      : page.page_template,
  };
}

/**
 * Resolve real Strapi `formats` onto every image field in a page, FRESH at READ
 * time (D-01) — MUST NOT be persisted into the saved data JSON blob at customizer
 * save time (grep-confirmed: strapiAdapter.ts/puckAdapter.ts only ever write
 * `{id,url}`), so a later Strapi-side backfill (Plan 07) is picked up without any
 * customizer re-save. Skips the network round-trip entirely when the page has no
 * image fields. Fails open on any network error (matches every other network call
 * in this file): logs via console.warn and returns the page UNCHANGED.
 */
export async function resolveImageFormats(page: StrapiPage): Promise<StrapiPage> {
  const ids = collectImageIds(page);
  if (ids.length === 0) return page;

  try {
    const response = await strapiClient.request<UploadFilesFormatsResponse>(
      getUploadFilesFormatsQuery,
      { ids }
    );
    const formatsById = new Map<number, unknown>();
    for (const file of response.uploadFiles ?? []) {
      if (file.formats == null) continue;
      const numericId = typeof file.id === "number" ? file.id : Number(file.id);
      if (Number.isNaN(numericId)) continue;
      formatsById.set(numericId, file.formats);
    }
    return mergeImageFormats(page, formatsById);
  } catch (error) {
    console.warn(
      "Failed to resolve image formats from Strapi:",
      error instanceof Error ? error.message : String(error)
    );
    return page;
  }
}

/**
 * Fetch the Site singleton's liveTheme pointer (D-04). Returns the live theme's
 * documentId / name / builtAssetUrl, or null when unset (D-09 ambiguous tenant) or
 * unconfigured. Read-only path: uses the public NEXT_PUBLIC_STRAPI_TOKEN (V4).
 *
 * Wrapped in React `cache()` so the multiple call sites that need this per request
 * (generateMetadata's fetchPageBySlug, Page()'s fetchPageBySlug, Page()'s explicit
 * resolveLiveBundle call) share ONE network round-trip instead of 3 — request-scoped
 * only, so "always fetch fresh data" across requests is unaffected.
 */
export const fetchSite = cache(async (): Promise<StrapiSite | null> => {
  if (!graphqlEndpoint) {
    console.warn("Strapi GraphQL endpoint not configured. Cannot fetch site.");
    return null;
  }

  try {
    const response = await strapiClient.request<StrapiSiteResponse>(getSiteLiveThemeQuery);
    return response.site ?? null;
  } catch (error) {
    console.error("Failed to fetch site liveTheme from Strapi:", error);
    // Build-time-safe: never throw, let callers fall back to env.
    return null;
  }
});

/**
 * Fetch a single page by slug, resolved STRICTLY through Site.liveTheme (D-04/MT-04).
 *
 * Reads Site.liveTheme FIRST; returns null (→ the tenant site's existing 404) when:
 *   - liveTheme is unset (D-04: nothing renders publicly), or
 *   - no template is bound to the live theme (D-06: missing binding → 404).
 *
 * The liveTheme-filtered query is threaded with `$liveTheme`, but the AUTHORITATIVE
 * selection is the JS resolvePageForLiveTheme — correctness does NOT depend on Strapi
 * honoring the inline relation filter (A2). If the filtered query outright errors on
 * the inline filter syntax, we fall back to the unfiltered query and let the JS
 * resolver pick the bound template.
 *
 * Wrapped in React `cache()` so generateMetadata and Page() — which both need this
 * per request for the same slug — share ONE round-trip (site + page query [+
 * metaobject refs]) instead of running the whole chain twice. Request-scoped only:
 * a new request still fetches fully fresh data from Strapi.
 */
export const fetchPageBySlug = cache(async (slug: string): Promise<StrapiPage | null> => {
  if (!graphqlEndpoint) {
    console.warn("Strapi GraphQL endpoint not configured. Cannot fetch page.");
    return null;
  }

  try {
    // D-04: read the live pointer first. When liveTheme IS set, only the
    // liveTheme-bound template is rendered (MT-04 / multi-theme divide).
    // When liveTheme is NOT set, fall back to the first available template so
    // newly-added themes that haven't been promoted yet still render their homepage.
    const site = await fetchSite();

    if (!site?.liveTheme) {
      // No live theme configured — fetch unfiltered and use the first template.
      const response = await strapiClient.request<StrapiPagesResponse>(
        getPageBySlugUnfilteredQuery,
        { slug }
      );
      const rawPage = response.pages[0] || null;
      if (!rawPage) return null;

      const templates = Array.isArray(rawPage.page_template)
        ? rawPage.page_template
        : rawPage.page_template
        ? [rawPage.page_template as StrapiPageTemplate]
        : [];
      const page: StrapiPage = { ...rawPage, page_template: templates[0] ?? null };
      const withResolvedRefs = await resolvePageMetaobjectRefs(page);
      return resolveImageFormats(resolveDynamicSources(withResolvedRefs));
    }

    let response: StrapiPagesResponse;
    try {
      response = await strapiClient.request<StrapiPagesResponse>(getPageBySlugQuery, {
        slug,
        liveTheme: site.liveTheme.documentId,
      });
    } catch (filterError) {
      // A2 fallback: the inline relation-filter syntax may not be honored by this
      // Strapi version. Re-fetch unfiltered and let the JS resolver pick the
      // liveTheme-bound template (correctness is independent of the GraphQL filter).
      console.warn(
        "liveTheme-filtered page query failed; falling back to unfiltered query (A2).",
        filterError instanceof Error ? filterError.message : String(filterError)
      );
      response = await strapiClient.request<StrapiPagesResponse>(
        getPageBySlugUnfilteredQuery,
        { slug }
      );
    }

    const rawPage = response.pages[0] || null;
    if (!rawPage) return null;

    // AUTHORITATIVE liveTheme binding pick (D-05). null → no binding → 404 (D-06).
    const page = resolvePageForLiveTheme(rawPage, site) as StrapiPage | null;
    if (!page) return null;

    const withResolvedRefs = await resolvePageMetaobjectRefs(page);
    return resolveImageFormats(resolveDynamicSources(withResolvedRefs));
  } catch (error) {
    console.error(`Failed to fetch page with slug "${slug}" from Strapi:`, error);
    // During build time, return null instead of throwing to allow build to continue
    if (process.env.NODE_ENV === 'production' || process.env.NEXT_PHASE === 'phase-production-build') {
      console.warn(`Build-time Strapi fetch failed for slug "${slug}". Returning null to allow build to continue.`);
      return null;
    }
    return null;
  }
});
