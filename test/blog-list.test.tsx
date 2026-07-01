import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect } from "vitest";

import { BlogList, blogListSettingsSchema } from "@/sections/BlogList";

// ---------------------------------------------------------------------------
// BlogList section (BLG-03, BLG-04, BLG-05).
//
// The stateless Blog index: decorative category chips (skip-empty + active pill),
// a toggleable featured post (ImageGuard placeholder + two conditional tags +
// real "Leer artículo" link), a responsive 1→2→3 card grid wrapping a single
// BlocksSlot (default EmptyState kept), and an inert-or-real load-more.
//
// The vitest env is `node`; the section renders under renderToStaticMarkup.
// No state, no handlers — chips and the empty load-more are purely presentational.
// ---------------------------------------------------------------------------

describe("BlogList — blank props", () => {
  it("renders under renderToStaticMarkup with blank props without throwing", () => {
    expect(() => renderToStaticMarkup(<BlogList />)).not.toThrow();
  });

  it("emits non-empty markup with blank props", () => {
    const html = renderToStaticMarkup(<BlogList />);
    expect(html.length).toBeGreaterThan(0);
  });
});

describe("BlogList — category chips (D-05/06/07)", () => {
  const html = renderToStaticMarkup(
    <BlogList
      chip1Label="Todos"
      chip2Label=""
      chip3Label="Promos"
      chip4Label=""
      chip5Label=""
      chip6Label=""
      activeChip="1"
      showFeatured={false}
    />,
  );

  it("renders present chip labels and skips empty labels", () => {
    expect(html).toContain("Todos");
    expect(html).toContain("Promos");
    // Only two chips render (chip2..chip6 empty are skipped — no empty chip span).
    const chipCount = (html.match(/py-1\.5/g) || []).length;
    expect(chipCount).toBe(2);
  });

  it("styles the active chip as a navy pill and present others as bordered", () => {
    expect(html).toMatch(
      /bg-brand-navy px-5 py-1\.5 font-gotham text-sm font-bold text-white/,
    );
    expect(html).toMatch(
      /border border-border bg-card px-5 py-1\.5 font-gotham text-sm font-bold text-brand-navy/,
    );
  });

  it("renders chips as inert spans with no href", () => {
    expect(html).not.toMatch(/<a[^>]*>\s*Todos/);
    expect(html).not.toMatch(/<a[^>]*>\s*Promos/);
  });
});

describe("BlogList — featured toggle (D-08)", () => {
  it("shows the featured title when showFeatured is true", () => {
    const html = renderToStaticMarkup(
      <BlogList showFeatured={true} featuredTitle="Recibe tus compras desde Europa" />,
    );
    expect(html).toContain("Recibe tus compras desde Europa");
  });

  it("hides the featured post when showFeatured is false", () => {
    const html = renderToStaticMarkup(
      <BlogList showFeatured={false} featuredTitle="Recibe tus compras desde Europa" />,
    );
    expect(html).not.toContain("Recibe tus compras desde Europa");
  });
});

describe("BlogList — featured image + tags (D-09)", () => {
  it("renders the ImageGuard placeholder when featuredImage is unset", () => {
    const html = renderToStaticMarkup(<BlogList showFeatured={true} />);
    expect(html).toContain("Agrega una imagen");
  });

  it("renders both conditional tags with the correct brand pills", () => {
    const html = renderToStaticMarkup(
      <BlogList
        showFeatured={true}
        featuredTagNavy="Artículo"
        featuredTagYellow="Destacado"
      />,
    );
    expect(html).toContain("Artículo");
    expect(html).toContain("Destacado");
    expect(html).toMatch(/bg-brand-navy[^"]*text-white[^"]*">Artículo/);
    expect(html).toMatch(/bg-brand-yellow[^"]*text-brand-navy[^"]*">Destacado/);
  });

  it("omits a tag when its value is empty", () => {
    const html = renderToStaticMarkup(
      <BlogList
        showFeatured={true}
        featuredTagNavy="Artículo"
        featuredTagYellow=""
      />,
    );
    expect(html).toContain("Artículo");
    expect(html).not.toContain("Destacado");
  });
});

describe("BlogList — card grid (D-10)", () => {
  it("lays the card slot out as a responsive 1→2→3 grid when blocks are present", () => {
    // The grid className lives on the BlocksSlot wrapper, which only renders when
    // one or more blocks exist (at zero it returns the bare EmptyState).
    const html = renderToStaticMarkup(
      <BlogList
        showFeatured={false}
        renderBlocks={() => [<span key="a">child</span>]}
      />,
    );
    expect(html).toContain("grid-cols-1");
    expect(html).toContain("sm:grid-cols-2");
    expect(html).toContain("lg:grid-cols-3");
  });

  it("shows the default EmptyState at zero blocks", () => {
    const html = renderToStaticMarkup(
      <BlogList showFeatured={false} renderBlocks={() => []} />,
    );
    expect(html).toContain("Sin elementos");
  });

  it("renders provided child blocks", () => {
    const html = renderToStaticMarkup(
      <BlogList
        showFeatured={false}
        renderBlocks={() => [<span key="a">child</span>]}
      />,
    );
    expect(html).toContain("child");
  });
});

describe("BlogList — load more (D-11)", () => {
  it("renders a real anchor when loadMoreUrl is set", () => {
    const html = renderToStaticMarkup(
      <BlogList
        showFeatured={false}
        loadMoreUrl="/blog/archivo"
        loadMoreLabel="Cargar más"
      />,
    );
    expect(html).toContain('href="/blog/archivo"');
    expect(html).toContain("Cargar más");
  });

  it("renders an inert element (no dead # anchor) when loadMoreUrl is empty", () => {
    const html = renderToStaticMarkup(
      <BlogList
        showFeatured={false}
        loadMoreUrl=""
        loadMoreLabel="Cargar más"
      />,
    );
    expect(html).toContain("Cargar más");
    expect(html).not.toContain('href="#"');
  });
});

describe("BlogList — statelessness", () => {
  it("emits no event handlers in the rendered markup", () => {
    const html = renderToStaticMarkup(
      <BlogList
        showFeatured={true}
        featuredTitle="X"
        renderBlocks={() => [<span key="a">child</span>]}
      />,
    );
    expect(html).not.toContain("onclick");
    expect(html).not.toContain("onchange");
  });
});

describe("BlogList — settings schema", () => {
  it("exposes every documented field id", () => {
    const ids = blogListSettingsSchema.map((s) => s.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        "chip1Label",
        "chip2Label",
        "chip3Label",
        "chip4Label",
        "chip5Label",
        "chip6Label",
        "activeChip",
        "showFeatured",
        "featuredImage",
        "featuredTagNavy",
        "featuredTagYellow",
        "featuredDate",
        "featuredTitle",
        "featuredExcerpt",
        "featuredLinkLabel",
        "featuredLinkUrl",
        "loadMoreLabel",
        "loadMoreUrl",
      ]),
    );
  });

  it("exposes an activeChip select defaulting to \"1\"", () => {
    const activeChip = blogListSettingsSchema.find((s) => s.id === "activeChip");
    expect(activeChip?.type).toBe("select");
    expect(activeChip?.default).toBe("1");
  });

  it("exposes a showFeatured checkbox defaulting to true", () => {
    const showFeatured = blogListSettingsSchema.find(
      (s) => s.id === "showFeatured",
    );
    expect(showFeatured?.type).toBe("checkbox");
    expect(showFeatured?.default).toBe(true);
  });

  it("defaults loadMoreLabel to \"Cargar más artículos\"", () => {
    const loadMoreLabel = blogListSettingsSchema.find(
      (s) => s.id === "loadMoreLabel",
    );
    expect(loadMoreLabel?.default).toBe("Cargar más artículos");
  });
});
