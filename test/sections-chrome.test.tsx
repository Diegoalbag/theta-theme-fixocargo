import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect } from "vitest";

import { AnnouncementBar, announcementBarSettingsSchema } from "@/sections/AnnouncementBar";
import { SiteHeader, siteHeaderSettingsSchema } from "@/sections/SiteHeader";
import { Footer, footerSettingsSchema } from "@/sections/Footer";
import { NavLink, navLinkSettingsSchema } from "@/blocks/NavLink";

// Render-smoke tests for the Phase 2 chrome sections.
// The vitest environment is `node` (no global document), so we render DOM-free
// with renderToStaticMarkup and assert on the returned HTML string.
// These tests prove the sections render without crashing and emit the
// correct structure — not that they look correct visually.
describe("AnnouncementBar", () => {
  it("renders without crash with empty props", () => {
    const html = renderToStaticMarkup(<AnnouncementBar />);
    expect(typeof html).toBe("string");
    expect(html.length).toBeGreaterThan(0);
  });

  it("renders role=banner on the outer wrapper", () => {
    const html = renderToStaticMarkup(<AnnouncementBar />);
    expect(html).toContain('role="banner"');
  });

  // The left-side location/change label block was retired in the FixoCargo
  // section-styling pass (commit be46441): the bar now shows only the follow
  // label + social-link slot, right-aligned. locationLabel/changeLabel remain
  // in the props/schema but are intentionally not rendered.
  it("does not render locationLabel text (label block retired)", () => {
    const html = renderToStaticMarkup(
      <AnnouncementBar locationLabel="Test Location" />,
    );
    expect(html).not.toContain("Test Location");
  });

  it("does not render changeLabel text (label block retired)", () => {
    const html = renderToStaticMarkup(
      <AnnouncementBar changeLabel="Test Change" />,
    );
    expect(html).not.toContain("Test Change");
  });

  it("renders followLabel text when provided", () => {
    const html = renderToStaticMarkup(
      <AnnouncementBar followLabel="Test Follow" />,
    );
    expect(html).toContain("Test Follow");
  });

  it("renders nothing in social slot when renderBlocks is undefined (empty={null})", () => {
    const html = renderToStaticMarkup(<AnnouncementBar />);
    // With empty={null}, the social-link slot renders nothing when empty —
    // no EmptyState heading should appear (per WR-01).
    expect(html).not.toContain("Sin elementos");
  });

  it("renders social-link blocks when renderBlocks returns blocks", () => {
    const html = renderToStaticMarkup(
      <AnnouncementBar
        renderBlocks={() => [
          <a key="fb" href="https://facebook.com">FB</a>,
        ]}
      />,
    );
    expect(html).toContain("FB");
  });

  it("announcementBarSettingsSchema has exactly 3 entries", () => {
    expect(announcementBarSettingsSchema).toHaveLength(3);
  });

  it("announcementBarSettingsSchema ids are locationLabel, changeLabel, followLabel", () => {
    const ids = announcementBarSettingsSchema.map((s) => s.id);
    expect(ids).toEqual(["locationLabel", "changeLabel", "followLabel"]);
  });
});

describe("SiteHeader", () => {
  it("renders without crash with empty props", () => {
    const html = renderToStaticMarkup(<SiteHeader />);
    expect(typeof html).toBe("string");
    expect(html.length).toBeGreaterThan(0);
  });

  it("renders accountLabel text when provided", () => {
    const html = renderToStaticMarkup(<SiteHeader accountLabel="Test Cuenta" />);
    expect(html).toContain("Test Cuenta");
  });

  it("renders mobile details element", () => {
    const html = renderToStaticMarkup(<SiteHeader />);
    expect(html).toContain("details");
  });

  it("renders default accountLabel when not provided", () => {
    const html = renderToStaticMarkup(<SiteHeader />);
    expect(html).toContain("Mi Cuenta");
  });

  it("renders accountUrl as anchor href when provided", () => {
    const html = renderToStaticMarkup(
      <SiteHeader accountUrl="https://example.com/account" />,
    );
    expect(html).toContain("https://example.com/account");
  });

  it("renders nav-link blocks when renderBlocks returns blocks", () => {
    const html = renderToStaticMarkup(
      <SiteHeader
        renderBlocks={() => [
          <a key="home" href="/home">Inicio</a>,
        ]}
      />,
    );
    expect(html).toContain("Inicio");
  });

  it("siteHeaderSettingsSchema has exactly 4 entries", () => {
    expect(siteHeaderSettingsSchema).toHaveLength(4);
  });

  it("siteHeaderSettingsSchema ids are logo, logoUrl, accountLabel, accountUrl", () => {
    const ids = siteHeaderSettingsSchema.map((s) => s.id);
    expect(ids).toEqual(["logo", "logoUrl", "accountLabel", "accountUrl"]);
  });

  it("wraps the logo image in a link to logoUrl (defaulting to /)", () => {
    const html = renderToStaticMarkup(
      <SiteHeader logo={{ id: "1", url: "/logo.png" }} logoUrl="/inicio" />,
    );
    expect(html).toMatch(/<a href="\/inicio"[^>]*><img[^>]*src="\/logo\.png"/);
  });

  it("defaults the logo link to / when logoUrl is omitted", () => {
    const html = renderToStaticMarkup(
      <SiteHeader logo={{ id: "1", url: "/logo.png" }} />,
    );
    expect(html).toMatch(/<a href="\/"[^>]*><img/);
  });

  // Plan 04 (D-01): logo emits srcset/sizes when formats data is present.
  it("renders a srcset attribute on the logo when logo.formats is supplied", () => {
    const html = renderToStaticMarkup(
      <SiteHeader
        logo={{
          id: "1",
          url: "/logo.png",
          formats: { small: { url: "/logo-small.png", width: 200 } },
        }}
      />,
    );
    // React 19's renderToStaticMarkup emits the literal `srcSet` prop casing
    // (never lowercased to `srcset`) — HTML attribute names are
    // case-insensitive to a real browser, so match case-insensitively here.
    expect(html).toMatch(/srcset=/i);
  });

  it("renders no srcset attribute on the logo when formats is omitted", () => {
    const html = renderToStaticMarkup(
      <SiteHeader logo={{ id: "1", url: "/logo.png" }} />,
    );
    expect(html).not.toMatch(/srcset=/i);
  });
});

// NAV-01 (phase 11, D-11-01 / D-11-06): `nav-link` grows a CSS-only submenu so
// the seven-service menu fits under ONE nav item without breaching
// site-header's maxBlocks: 8. The load-bearing assertions here are the
// BARE-ANCHOR ones — this block already carries saved merchant content, so the
// zero-child branch must stay byte-compatible with its pre-phase output.
describe("NavLink — CSS-only submenu (NAV-01)", () => {
  it("renders a bare anchor (no disclosure) when no child label is filled", () => {
    const html = renderToStaticMarkup(<NavLink label="Inicio" url="/" />);
    expect(html).toContain("<a");
    expect(html).toContain('href="/"');
    expect(html).toContain("Inicio");
    // Branch A byte-compatibility sensor: no disclosure chrome may appear.
    expect(html).not.toContain("<details");
    expect(html).not.toContain("<summary");
  });

  it("still renders a bare anchor plus a decorative caret with hasCaret and no children", () => {
    const html = renderToStaticMarkup(
      <NavLink label="Inicio" url="/" hasCaret />,
    );
    expect(html).not.toContain("<details");
    expect(html).not.toContain("<summary");
    // The ChevronDown lucide glyph still renders (today's behavior preserved).
    expect(html).toContain("<svg");
  });

  it("renders a native disclosure when at least one child label is filled", () => {
    const html = renderToStaticMarkup(
      <NavLink
        label="Servicios"
        url="/servicios"
        child1Label="Carga Aérea"
        child1Url="/carga-aerea"
      />,
    );
    expect(html).toContain("<details");
    expect(html).toContain("<summary");
    expect(html).toContain("Servicios");
    expect(html).toContain('href="/carga-aerea"');
    expect(html).toContain("Carga Aérea");
  });

  it("renders the caret in the submenu branch even when hasCaret is false", () => {
    const html = renderToStaticMarkup(
      <NavLink label="Servicios" child1Label="Carga Aérea" child1Url="/x" />,
    );
    // The caret now reflects real submenu state, not the decorative toggle.
    expect(html).toContain("group-open:rotate-180");
  });

  it("renders only the filled child slots — an empty slot contributes nothing", () => {
    const html = renderToStaticMarkup(
      <NavLink
        label="Servicios"
        child1Label="Uno"
        child1Url="/uno"
        child3Label="Tres"
        child3Url="/tres"
      />,
    );
    // Count anchors rather than asserting a single substring: the summary
    // holds no anchor, so every <a in this branch is a child link.
    const anchors = html.match(/<a\s/g) ?? [];
    expect(anchors).toHaveLength(2);
    expect(html).toContain('href="/uno"');
    expect(html).toContain('href="/tres"');
  });

  it("falls back to href=# for a child link with a label but no url", () => {
    const html = renderToStaticMarkup(
      <NavLink label="Servicios" child1Label="Sin URL" />,
    );
    expect(html).toContain('href="#"');
    expect(html).toContain("Sin URL");
  });

  it("renders no link-target attribute in either branch (T-11-08)", () => {
    const bare = renderToStaticMarkup(<NavLink label="Inicio" url="/" />);
    const submenu = renderToStaticMarkup(
      <NavLink
        label="Servicios"
        child1Label="Carga Aérea"
        child1Url="https://example.com/carga"
      />,
    );
    // No submenu link may open a new browsing context, so reverse tabnabbing
    // has no surface here.
    expect(bare).not.toMatch(/target=/i);
    expect(submenu).not.toMatch(/target=/i);
  });

  it("navLinkSettingsSchema has exactly 19 entries", () => {
    expect(navLinkSettingsSchema).toHaveLength(19);
  });

  it("navLinkSettingsSchema ids are label, url, hasCaret, then 8 child pairs", () => {
    const ids = navLinkSettingsSchema.map((s) => s.id);
    expect(ids).toEqual([
      "label",
      "url",
      "hasCaret",
      "child1Label",
      "child1Url",
      "child2Label",
      "child2Url",
      "child3Label",
      "child3Url",
      "child4Label",
      "child4Url",
      "child5Label",
      "child5Url",
      "child6Label",
      "child6Url",
      "child7Label",
      "child7Url",
      "child8Label",
      "child8Url",
    ]);
  });

  it("defaults every child label to the empty string so saved instances stay bare anchors", () => {
    const labelDefaults = navLinkSettingsSchema
      .filter((s) => /^child\d+Label$/.test(s.id))
      .map((s) => s.default);
    expect(labelDefaults).toHaveLength(8);
    expect(labelDefaults.every((d) => d === "")).toBe(true);
  });
});

describe("Footer", () => {
  it("renders without crash with empty props", () => {
    const html = renderToStaticMarkup(<Footer />);
    expect(typeof html).toBe("string");
    expect(html.length).toBeGreaterThan(0);
  });

  it("renders copyright text", () => {
    const html = renderToStaticMarkup(<Footer copyright="© Test 2026" />);
    expect(html).toContain("© Test 2026");
  });

  it("renders terms link as anchor", () => {
    const html = renderToStaticMarkup(
      <Footer
        termsLabel="Términos"
        termsUrl="https://example.com/terms"
      />,
    );
    expect(html).toContain('href="https://example.com/terms"');
  });

  it("renders privacy link as anchor", () => {
    const html = renderToStaticMarkup(
      <Footer
        privacyLabel="Políticas"
        privacyUrl="https://example.com/privacy"
      />,
    );
    expect(html).toContain('href="https://example.com/privacy"');
  });

  it("footerSettingsSchema has exactly 6 entries", () => {
    expect(footerSettingsSchema).toHaveLength(6);
  });

  it("footerSettingsSchema ids are logo, copyright, termsLabel, termsUrl, privacyLabel, privacyUrl", () => {
    const ids = footerSettingsSchema.map((s) => s.id);
    expect(ids).toEqual([
      "logo",
      "copyright",
      "termsLabel",
      "termsUrl",
      "privacyLabel",
      "privacyUrl",
    ]);
  });

  // Plan 04 (D-01): logo emits srcset/sizes when formats data is present.
  it("renders a srcset attribute on the logo when logo.formats is supplied", () => {
    const html = renderToStaticMarkup(
      <Footer
        logo={{
          id: "1",
          url: "/logo.png",
          formats: { small: { url: "/logo-small.png", width: 270 } },
        }}
      />,
    );
    // React 19's renderToStaticMarkup emits the literal `srcSet` prop casing
    // (never lowercased to `srcset`) — HTML attribute names are
    // case-insensitive to a real browser, so match case-insensitively here.
    expect(html).toMatch(/srcset=/i);
  });

  it("renders no srcset attribute on the logo when formats is omitted", () => {
    const html = renderToStaticMarkup(
      <Footer logo={{ id: "1", url: "/logo.png" }} />,
    );
    expect(html).not.toMatch(/srcset=/i);
  });
});
