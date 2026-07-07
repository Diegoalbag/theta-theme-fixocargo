import { describe, expect, it } from "vitest";
// RED (Phase 11, Plan 02, Task 2): `collectImageIds`/`mergeImageFormats` are built
// in this same task (D-01 frontend half — resolve real Strapi `formats` onto every
// image field at READ time, never persisted at save time). This suite MUST fail
// now (member absent) so the fresh-at-read resolution has an automated gate.
//
// Contract under test:
//   - collectImageIds(page) walks sections, blocks, AND metafields (same shape as
//     resolvePageMetaobjectRefs's referencedIds collection), dedupes, collects both
//     bare numeric ids and {id,url} object ids.
//   - mergeImageFormats(page, formatsById) immutably writes `formats` INTO the
//     existing {type:'image', value:{id,url}} wrapper (value.formats) without
//     touching id/url, leaves unmatched ids untouched, never throws.
import { collectImageIds, mergeImageFormats, type StrapiPage } from "../strapi-client";

function pageWithHero(heroValue: unknown): StrapiPage {
  return {
    documentId: "page-1",
    title: "Home",
    slug: "home",
    page_template: {
      documentId: "tmpl-1",
      sections: [
        {
          sectionKey: "hero",
          order: 0,
          data: { hero: { type: "image", value: heroValue } },
        },
      ],
    },
  };
}

describe("collectImageIds — walks sections/blocks/metafields, dedupes (D-01)", () => {
  it("Test 1a: collects an image id from section data ({id,url} object)", () => {
    const page = pageWithHero({ id: 42, url: "/x.jpg" });
    expect(collectImageIds(page)).toEqual([42]);
  });

  it("Test 1b: dedupes the same image id referenced in a section AND a block", () => {
    const page: StrapiPage = {
      documentId: "page-1",
      title: "Home",
      slug: "home",
      page_template: {
        documentId: "tmpl-1",
        sections: [
          {
            sectionKey: "hero",
            order: 0,
            data: { hero: { type: "image", value: { id: 42, url: "/x.jpg" } } },
            blocks: [
              {
                blockType: "logo",
                order: 0,
                data: { logo: { type: "image", value: { id: 42, url: "/x.jpg" } } },
              },
            ],
          },
        ],
      },
    };
    expect(collectImageIds(page)).toEqual([42]);
  });

  it("Test 1c: collects a bare numeric id (no url yet)", () => {
    const page = pageWithHero(7);
    expect(collectImageIds(page)).toEqual([7]);
  });

  it("Test 1d: returns [] when no image fields exist anywhere", () => {
    const page: StrapiPage = {
      documentId: "page-1",
      title: "Home",
      slug: "home",
      page_template: {
        documentId: "tmpl-1",
        sections: [{ sectionKey: "hero", order: 0, data: { title: { type: "text", value: "Hi" } } }],
      },
    };
    expect(collectImageIds(page)).toEqual([]);
  });
});

describe("mergeImageFormats — immutable formats merge into value.formats (D-01)", () => {
  it("Test 2a: writes formats INTO value.formats, leaves id/url unchanged", () => {
    const page = pageWithHero({ id: 42, url: "/x.jpg" });
    const formatsById = new Map([[42, { thumbnail: { url: "/t.jpg", width: 245 } }]]);
    const merged = mergeImageFormats(page, formatsById);
    const heroValue = (merged.page_template as { sections: Array<{ data: Record<string, unknown> }> })
      .sections[0].data.hero as { value: { id: number; url: string; formats?: unknown } };
    expect(heroValue.value.formats).toEqual({ thumbnail: { url: "/t.jpg", width: 245 } });
    expect(heroValue.value.id).toBe(42);
    expect(heroValue.value.url).toBe("/x.jpg");
  });

  it("Test 2b: leaves an image value unchanged (no formats key added, no throw) when its id has no formatsById entry", () => {
    const page = pageWithHero({ id: 99, url: "/y.jpg" });
    const formatsById = new Map([[42, { thumbnail: { url: "/t.jpg", width: 245 } }]]);
    const merged = mergeImageFormats(page, formatsById);
    const heroValue = (merged.page_template as { sections: Array<{ data: Record<string, unknown> }> })
      .sections[0].data.hero as { value: { id: number; url: string; formats?: unknown } };
    expect(heroValue.value).toEqual({ id: 99, url: "/y.jpg" });
    expect("formats" in heroValue.value).toBe(false);
  });

  it("Test 3: merges formats for image fields nested in blocks AND page.metafields (same traversal shape as collectImageIds)", () => {
    const page: StrapiPage = {
      documentId: "page-1",
      title: "Home",
      slug: "home",
      metafields: { logo: { type: "image", value: { id: 5, url: "/logo.jpg" } } },
      page_template: {
        documentId: "tmpl-1",
        sections: [
          {
            sectionKey: "hero",
            order: 0,
            data: {},
            blocks: [
              {
                blockType: "feature",
                order: 0,
                data: { icon: { type: "image", value: { id: 8, url: "/icon.jpg" } } },
              },
            ],
          },
        ],
      },
    };
    const formatsById = new Map([
      [5, { thumbnail: { url: "/logo-t.jpg", width: 100 } }],
      [8, { thumbnail: { url: "/icon-t.jpg", width: 50 } }],
    ]);
    const merged = mergeImageFormats(page, formatsById);

    const metaLogo = (merged.metafields as Record<string, { value: { formats?: unknown } }>).logo;
    expect(metaLogo.value.formats).toEqual({ thumbnail: { url: "/logo-t.jpg", width: 100 } });

    const blockIcon = (
      merged.page_template as {
        sections: Array<{ blocks: Array<{ data: Record<string, { value: { formats?: unknown } }> }> }>;
      }
    ).sections[0].blocks[0].data.icon;
    expect(blockIcon.value.formats).toEqual({ thumbnail: { url: "/icon-t.jpg", width: 50 } });
  });
});
