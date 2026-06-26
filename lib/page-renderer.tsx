"use client";

import { useEffect, useState } from "react";
import type { LoadedThemeModule } from "./theme-loader";
import { loadThemeFromUrl, getLoadedTheme } from "./theme-loader";
import type { StrapiPage, StrapiBlock } from "./strapi-client";

/** Normalize section key for lookup (lowercase, trim). */
function normalizeSectionKey(key: string): string {
  return key.trim().toLowerCase();
}

/** Normalize block type for lookup (lowercase, trim). */
function normalizeBlockType(type: string): string {
  return type.trim().toLowerCase();
}

/**
 * Resolve block component from theme module.
 * Checks blocksComponents first, then localBlocks in sectionBlocksConfig.
 */
function getBlockComponent(
  blockType: string,
  sectionKey: string,
  themeModule: LoadedThemeModule
): React.ComponentType<Record<string, unknown>> | null {
  const blocksComponents = themeModule.blocksComponents ?? {};
  // Direct match
  if (blocksComponents[blockType]) return blocksComponents[blockType];
  const normalized = normalizeBlockType(blockType);
  const themeMatch = Object.keys(blocksComponents).find(
    (k) => normalizeBlockType(k) === normalized
  );
  if (themeMatch) return blocksComponents[themeMatch];

  // Check local blocks for this section
  const sectionConfig = themeModule.sectionBlocksConfig?.[sectionKey];
  const localBlocks = sectionConfig?.localBlocks ?? [];
  const local = localBlocks.find((l) => normalizeBlockType(l.type) === normalized);
  return local?.component ?? null;
}

/**
 * If url is a Next.js image optimization URL (/_next/image?url=...), return the actual image URL.
 * Otherwise return the url unchanged. Ensures build/deploy always gets the real Strapi URL.
 */
function normalizeImageUrl(url: string | null | undefined): string | null {
  if (url == null || typeof url !== "string" || url.trim() === "") return url ?? null;
  if (!url.includes("_next/image")) return url;
  try {
    const idx = url.indexOf("?");
    if (idx === -1) return url;
    const params = new URLSearchParams(url.slice(idx));
    const actual = params.get("url");
    return actual ? decodeURIComponent(actual) : url;
  } catch {
    return url;
  }
}

/**
 * Resolve section key from page/CMS to theme's sectionsComponents key.
 * Tries exact match first, then normalized match so "header" matches "Header".
 */
function getSectionComponentKey(
  sectionKey: string,
  sectionsComponents: Record<string, React.ComponentType<Record<string, unknown>>>
): string | null {
  if (sectionsComponents[sectionKey]) return sectionKey;
  const normalized = normalizeSectionKey(sectionKey);
  const match = Object.keys(sectionsComponents).find(
    (k) => normalizeSectionKey(k) === normalized
  );
  return match ?? null;
}

interface BlockRendererProps {
  block: StrapiBlock;
  sectionKey: string;
  themeModule: LoadedThemeModule;
}

function BlockRenderer({ block, sectionKey, themeModule }: BlockRendererProps) {
  const BlockComponent = getBlockComponent(block.blockType, sectionKey, themeModule);
  if (!BlockComponent) {
    console.warn(`Block component not found: ${block.blockType} (section: ${sectionKey})`);
    return (
      <div className="p-2 border border-dashed border-muted rounded text-sm text-muted-foreground">
        Block "{block.blockType}" not found in theme
      </div>
    );
  }
  const props = convertStrapiDataToProps(block.data);
  const componentProps = {
    ...props,
    blockId: block.id?.toString(),
    blockType: block.blockType,
  };
  return <BlockComponent {...componentProps} />;
}

interface PageRendererProps {
  page: StrapiPage;
  themeBundleUrl: string;
  themeName: string;
  /**
   * Optional URL for the theme's CSS. If not set, derived from themeBundleUrl
   * (.js → .css). Kept optional so this component stays compatible with both the
   * server-stylesheet path in app/[slug]/page.tsx and older callers that pass it.
   */
  themeCssUrl?: string;
}

/**
 * Component that renders a page using theme components.
 *
 * Flash fix: this no longer paints a "Loading theme…" screen — while the bundle
 * downloads it renders a silent, full-height placeholder. The theme stylesheet is
 * rendered declaratively with a `precedence`, so React 19 hoists it into the
 * server-rendered <head> as a render-blocking resource (no flash of unstyled
 * content), and theme state is seeded from the loader cache so client-side
 * navigations paint instantly.
 */
export function PageRenderer({ page, themeBundleUrl, themeName, themeCssUrl }: PageRendererProps) {
  // Seed from the loader cache synchronously so an already-loaded theme (e.g. a
  // client-side navigation between pages) renders on the first paint with no flash.
  const [themeModule, setThemeModule] = useState<LoadedThemeModule | null>(() =>
    getLoadedTheme(themeName)
  );
  const [loading, setLoading] = useState(() => getLoadedTheme(themeName) === null);
  const [error, setError] = useState<string | null>(null);

  // Theme stylesheet. Rendered declaratively (NOT injected in an effect) so React
  // 19 hoists it into the server-rendered <head> as a render-blocking, deduped
  // resource. This is what kills the flash of unstyled content: the CSS is fetched
  // during initial HTML parse and applied before any theme content paints. The
  // `precedence` prop is what makes React treat it as a hoistable stylesheet; it is
  // emitted in every render branch and deduped by href, so it stays in <head>
  // across the loading → loaded transition.
  const effectiveCssUrl =
    themeCssUrl ?? (themeBundleUrl ? themeBundleUrl.replace(/\.js$/i, ".css") : undefined);
  const themeStylesheet = effectiveCssUrl ? (
    <link
      rel="stylesheet"
      href={effectiveCssUrl}
      precedence="theme"
      data-theme-stylesheet={themeName}
    />
  ) : null;

  useEffect(() => {
    // Check cache first
    const cached = getLoadedTheme(themeName);
    if (cached) {
      setThemeModule(cached);
      setLoading(false);
      return;
    }

    // Load theme bundle (already preloaded via <link rel="preload">, so this
    // resolves from cache almost immediately).
    loadThemeFromUrl(themeBundleUrl, themeName)
      .then((module) => {
        setThemeModule(module);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load theme:", err);
        setError(err instanceof Error ? err.message : "Failed to load theme");
        setLoading(false);
      });
  }, [themeBundleUrl, themeName]);

  if (loading) {
    // Silent placeholder — no "Loading…" text. Also eagerly preload the bundle so
    // the download starts immediately even when page.tsx didn't emit a preload.
    return (
      <>
        {themeStylesheet}
        <link rel="preload" as="script" href={themeBundleUrl} crossOrigin="anonymous" />
        <div className="min-h-screen" aria-hidden="true" />
      </>
    );
  }

  if (error || !themeModule) {
    return (
      <>
        {themeStylesheet}
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-semibold text-destructive">Error loading theme</p>
            <p className="text-sm text-muted-foreground">{error || "Theme module not found"}</p>
          </div>
        </div>
      </>
    );
  }

  // Sort sections by order from the template. page_template is the liveTheme-bound
  // single template after resolvePageForLiveTheme, but the type is a manyToMany union
  // (D-14) — coerce array → first defensively.
  const template = Array.isArray(page.page_template)
    ? page.page_template[0]
    : page.page_template;
  const sections = template?.sections || [];
  const sortedSections = [...sections].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );

  return (
    <>
      {themeStylesheet}
      <div className="min-h-screen">
        {sortedSections.map((section, index) => {
        const resolvedKey = getSectionComponentKey(
          section.sectionKey,
          themeModule.sectionsComponents
        );
        const SectionComponent = resolvedKey
          ? themeModule.sectionsComponents[resolvedKey]
          : null;

        if (!SectionComponent) {
          // D-12 (MT-09): an orphaned section — its key is absent from the loaded
          // theme's sectionsComponents manifest — is SKIPPED (render nothing) on the
          // live public site. Never throw, never show debug chrome to end users. The
          // pure predicate lives in @/lib/customizer/orphan-section; the deployed
          // theme-site is tsconfig-excluded so the same skip behavior is inlined here.
          // Keep the console.warn for debuggability.
          console.warn(`Section component not found: ${section.sectionKey}`);
          return null;
        }

        // Convert Strapi data to component props
        // Strapi stores data as typed values: { type: 'text', value: '...' }
        // Components expect flat props: { title: '...', content: '...' }
        const props = convertStrapiDataToProps(section.data);

        // Add section metadata props that components might expect
        const componentProps: Record<string, unknown> = {
          ...props,
          sectionId: section.id?.toString() || `${section.sectionKey}-${index}`,
          sectionName: section.sectionKey,
        };

        // Sort blocks for this section
        const sortedBlocks = [...(section.blocks || [])].sort(
          (a, b) => (a.order ?? 0) - (b.order ?? 0)
        );

        // Pass renderBlocks so the section can render blocks inside its layout (the slot)
        // Sections that support blocks call renderBlocks() where they want blocks to appear
        if (sortedBlocks.length > 0) {
          componentProps.renderBlocks = () =>
            sortedBlocks.map((block, blockIndex) => (
              <BlockRenderer
                key={block.id ?? `${section.sectionKey}-block-${blockIndex}`}
                block={block}
                sectionKey={section.sectionKey}
                themeModule={themeModule}
              />
            ));
        }

        return (
          <div key={section.id || index}>
            <SectionComponent {...componentProps} />
          </div>
        );
      })}
      </div>
    </>
  );
}

/**
 * Convert page metafields (Record<string, unknown>) to flat component props.
 * Reuses convertStrapiDataToProps so all field type normalization applies.
 */
export function convertPageMetafields(
  raw: Record<string, unknown> | null | undefined
): Record<string, unknown> {
  if (!raw) return {};
  return convertStrapiDataToProps(raw);
}

/**
 * Convert Strapi typed data to flat component props
 * Strapi stores: { title: { type: 'text', value: 'Hello' } }
 * Components expect: { title: 'Hello' }
 *
 * Handles all field types including images, videos, page references, etc.
 */
function convertStrapiDataToProps(
  data: Record<string, unknown>
): Record<string, unknown> {
  const props: Record<string, unknown> = {};

  for (const [key, typedValue] of Object.entries(data)) {
    if (typedValue && typeof typedValue === "object" && "type" in typedValue && "value" in typedValue) {
      const typed = typedValue as { type: string; value: unknown };
      
      // Handle different field types
      switch (typed.type) {
        case "text":
        case "textarea":
        case "number":
        case "boolean":
        case "color":
        case "url":
        case "video_url":
        case "font_picker":
        case "richtext":
        case "html":
        case "text_alignment":
          // Simple types: extract value directly
          props[key] = typed.value;
          break;

        case "image": {
          // Image type: value is file ID or image object
          // Always return an object structure (never null/undefined) so theme components can safely access .url
          if (typed.value && typeof typed.value === "object") {
            const obj = typed.value as { id?: number | null; url?: string | null };
            const url = normalizeImageUrl(obj.url) ?? obj.url ?? null;
            props[key] = { ...obj, url };
          } else if (typeof typed.value === "number") {
            // Just an ID, construct image object
            props[key] = {
              id: typed.value,
              url: null, // URL will be resolved by component if needed
            };
          } else {
            // Value is null, undefined, or unexpected type - return empty object structure
            props[key] = {
              id: null,
              url: null,
            };
          }
          break;
        }

        case "video": {
          // Video type: similar to image
          // Always return an object structure (never null/undefined) so theme components can safely access .url
          if (typed.value && typeof typed.value === "object") {
            props[key] = typed.value;
          } else if (typeof typed.value === "number") {
            props[key] = {
              id: typed.value,
              url: null,
            };
          } else {
            // Value is null, undefined, or unexpected type - return empty object structure
            props[key] = {
              id: null,
              url: null,
            };
          }
          break;
        }

        case "metaobject_ref": {
          // MVP: refs are pre-resolved server-side in strapi-client.ts (push model).
          // This case is a fallback — passes the raw documentId string to the theme.
          // TODO: When the theme has its own API client, it will receive this documentId
          // and fetch the entry data directly, removing the need for server-side resolution.
          props[key] = typed.value;
          break;
        }

        case "page_reference": {
          // Page reference: value might be string (slug) or object
          props[key] = typed.value;
          break;
        }

        case "json": {
          // JSON type: check if it's an image/video stored as JSON
          const jsonValue = typed.value;
          if (jsonValue && typeof jsonValue === "object" && !Array.isArray(jsonValue)) {
            const obj = jsonValue as Record<string, unknown>;
            // If it looks like an image/video object, normalize url so build/deploy gets real Strapi URL
            if (("id" in obj || "url" in obj) && !("slug" in obj && "title" in obj)) {
              const rawUrl = typeof obj.url === "string" ? obj.url : null;
              const url = normalizeImageUrl(rawUrl) ?? rawUrl;
              props[key] = { ...obj, url };
            } else {
              props[key] = jsonValue;
            }
          } else {
            props[key] = jsonValue;
          }
          break;
        }

        default:
          // Unknown type: try to extract value, fallback to full object
          props[key] = typed.value ?? typedValue;
      }
    } else {
      // Already flat, use as-is
      props[key] = typedValue;
    }
  }

  return props;
}
