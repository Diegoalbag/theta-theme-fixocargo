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
 * Fetch the Site singleton's liveTheme pointer (D-04). Returns the live theme's
 * documentId / name / builtAssetUrl, or null when unset (D-09 ambiguous tenant) or
 * unconfigured. Read-only path: uses the public NEXT_PUBLIC_STRAPI_TOKEN (V4).
 */
export async function fetchSite(): Promise<StrapiSite | null> {
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
}

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
 */
export async function fetchPageBySlug(slug: string): Promise<StrapiPage | null> {
  if (!graphqlEndpoint) {
    console.warn("Strapi GraphQL endpoint not configured. Cannot fetch page.");
    return null;
  }

  try {
    // D-04: read the live pointer first. No live theme → nothing public.
    const site = await fetchSite();
    if (!site?.liveTheme) return null;

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
    return resolveDynamicSources(withResolvedRefs);
  } catch (error) {
    console.error(`Failed to fetch page with slug "${slug}" from Strapi:`, error);
    // During build time, return null instead of throwing to allow build to continue
    if (process.env.NODE_ENV === 'production' || process.env.NEXT_PHASE === 'phase-production-build') {
      console.warn(`Build-time Strapi fetch failed for slug "${slug}". Returning null to allow build to continue.`);
      return null;
    }
    return null;
  }
}
