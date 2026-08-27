import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect } from "vitest";

import { AnnouncementBar, announcementBarSettingsSchema } from "@/sections/AnnouncementBar";
import { SiteHeader, siteHeaderSettingsSchema } from "@/sections/SiteHeader";
import { Footer, footerSettingsSchema } from "@/sections/Footer";
import { NavLink, navLinkSettingsSchema } from "@/blocks/NavLink";
import { sectionBlocksConfig } from "@/registry";

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

  // Phase 11 regression guard: the nav-link submenu exists precisely SO THAT
  // the seven-service menu fits under one nav item without raising this cap.
  // If either assertion drifts, the reason the submenu was built is gone.
  it("site-header still caps at 8 blocks", () => {
    expect(sectionBlocksConfig["site-header"].maxBlocks).toBe(8);
  });

  it("site-header still accepts nav-link blocks", () => {
    const types = sectionBlocksConfig["site-header"].blocks.map((b) => b.type);
    expect(types).toContain("nav-link");
  });

  it("siteHeaderSettingsSchema has exactly 5 entries", () => {
    expect(siteHeaderSettingsSchema).toHaveLength(5);
  });

  it("siteHeaderSettingsSchema ids are logo, logoUrl, logoSize, accountLabel, accountUrl", () => {
    const ids = siteHeaderSettingsSchema.map((s) => s.id);
    expect(ids).toEqual([
      "logo",
      "logoUrl",
      "logoSize",
      "accountLabel",
      "accountUrl",
    ]);
  });

  it("logoSize drives the logo height class and defaults to md (h-12)", () => {
    const img = { id: "1", url: "/logo.png" };
    expect(renderToStaticMarkup(<SiteHeader logo={img} />)).toContain("h-12");
    expect(
      renderToStaticMarkup(<SiteHeader logo={img} logoSize="sm" />),
    ).toContain("h-10");
    expect(
      renderToStaticMarkup(<SiteHeader logo={img} logoSize="lg" />),
    ).toContain("h-14");
  });

  it("an unknown logoSize degrades to the md height instead of dropping the class", () => {
    const html = renderToStaticMarkup(
      // @ts-expect-error — deliberately arbitrary value, mirrors a stale saved prop
      <SiteHeader logo={{ id: "1", url: "/logo.png" }} logoSize="bogus" />,
    );
    expect(html).toContain("h-12");
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

// NAV-01 (phase 11, D-11-01 / D-11-06): `nav-link` grows a native-disclosure
// submenu so the seven-service menu fits under ONE nav item without breaching
// site-header's maxBlocks: 8. It shipped CSS-only in phase 11; quick task
// 260814-f97 added one guarded dismissal effect on top of the SAME markup —
// the pins at the top of this block are what prove the markup did not move.
// The load-bearing assertions here are the
// BARE-ANCHOR ones — this block already carries saved merchant content, so the
// zero-child branch must stay byte-compatible with its pre-phase output.
describe("NavLink — native submenu (NAV-01)", () => {
  // D-04 byte-identity contract (quick task 260814-f97). This block already
  // carries saved merchant nav items, and the dismissal effect added by that
  // task must be invisible to every one of them. The literal below was
  // captured from the UNTOUCHED component and is pinned with `toBe`, never a
  // substring match: if this goes red the COMPONENT changed and the component
  // is what gets fixed — the assertion is never relaxed.
  it("renders a byte-identical bare anchor when no child label is filled (D-04)", () => {
    const html = renderToStaticMarkup(<NavLink label="Inicio" url="/" />);
    expect(html).toBe(
      '<a href="/" class="inline-flex items-center gap-1 font-opensans text-sm text-white whitespace-nowrap hover:text-brand-yellow focus-visible:outline-2 focus-visible:outline-brand-yellow focus-visible:outline-offset-2">Inicio</a>',
    );
  });

  // The dismissal wiring is imperative and lives entirely inside one guarded
  // effect, so nothing handler-shaped may ever leak into the served markup —
  // in EITHER branch. An `on*=` attribute in the SSR string would mean a JSX
  // handler was added instead.
  it("emits no scripted attribute in the served markup of either branch", () => {
    const bare = renderToStaticMarkup(<NavLink label="Inicio" url="/" />);
    const submenu = renderToStaticMarkup(
      <NavLink
        label="Servicios"
        url="/servicios"
        child1Label="Uno"
        child1Url="/uno"
        child2Label="Dos"
        child2Url="/dos"
      />,
    );
    expect(bare).not.toMatch(/\son[a-z]+=/i);
    expect(submenu).not.toMatch(/\son[a-z]+=/i);
  });

  // D-05 structural proof. The effect must resolve its own elements by ref and
  // test containment — never build a selector, never walk outward from the
  // block root (the CR-01/CR-02 scars from quick task 260813-fe3, where a walk
  // from a block root claimed the customizer's injected `display: contents`
  // host slot). Comments are stripped first: this file's own header prose names
  // the forbidden patterns, so a raw scan would false-positive on the
  // documentation. Same strip pair test/static-audit.test.tsx uses.
  it("has no React state, no document query and no outward DOM walk in source (D-05)", () => {
    const source = readFileSync(
      resolve(process.cwd(), "src/blocks/NavLink/NavLink.tsx"),
      "utf-8",
    )
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/[^\n]*/g, "");
    expect(source).not.toMatch(/useState/);
    expect(source).not.toMatch(/querySelector/);
    expect(source).not.toMatch(/getElementById/);
    expect(source).not.toMatch(/\.closest\(/);
  });

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

  // CR-02 regression guard. A <summary> only toggles the disclosure — it never
  // navigates — so before this guard a nav item with children silently dropped
  // its own destination: the merchant kept editing "Enlace URL" in the sidebar
  // while the rendered nav item stopped linking anywhere, on desktop AND mobile.
  // This is the exact D-11-01 use case (seven services under one "Servicios"
  // item that must still reach /servicios).
  it("keeps the parent url reachable in the submenu branch (CR-02)", () => {
    const html = renderToStaticMarkup(
      <NavLink
        label="Servicios"
        url="/servicios"
        child1Label="Carga Aérea"
        child1Url="/carga-aerea"
      />,
    );
    expect(html).toContain("<details");
    // The parent destination is rendered, and it is rendered as an anchor —
    // not merely present as a discarded prop.
    expect(html).toContain('href="/servicios"');
    const anchors = html.match(/<a\s/g) ?? [];
    expect(anchors).toHaveLength(2);
    // It leads the panel, ahead of the child links.
    expect(html.indexOf('href="/servicios"')).toBeLessThan(
      html.indexOf('href="/carga-aerea"'),
    );
  });

  it("adds no parent entry when url is the `#` schema default or blank (CR-02)", () => {
    const defaulted = renderToStaticMarkup(
      <NavLink label="Servicios" url="#" child1Label="Uno" child1Url="/uno" />,
    );
    // `#` means "no destination" — it must not become a duplicate dead entry.
    expect((defaulted.match(/<a\s/g) ?? []).length).toBe(1);
    expect(defaulted).toContain('href="/uno"');

    const blank = renderToStaticMarkup(
      <NavLink label="Servicios" url="" child1Label="Uno" child1Url="/uno" />,
    );
    expect((blank.match(/<a\s/g) ?? []).length).toBe(1);

    const whitespace = renderToStaticMarkup(
      <NavLink label="Servicios" url="   " child1Label="Uno" child1Url="/uno" />,
    );
    expect((whitespace.match(/<a\s/g) ?? []).length).toBe(1);
  });

  it("renders the caret in the submenu branch even when hasCaret is false", () => {
    const html = renderToStaticMarkup(
      <NavLink label="Servicios" child1Label="Carga Aérea" child1Url="/x" />,
    );
    // The caret now reflects real submenu state, not the decorative toggle.
    expect(html).toContain("group-open:rotate-180");
  });

  // WR-07. This filter picks the BRANCH, so a whitespace-only label is not a
  // cosmetic blank — it silently converts a saved plain anchor into a
  // disclosure with a blank, focusable submenu entry, and (before CR-02) took
  // the parent's destination with it.
  it("treats a whitespace-only child label as empty and stays a bare anchor (WR-07)", () => {
    const html = renderToStaticMarkup(
      <NavLink label="Inicio" url="/" child1Label="   " child1Url="/uno" />,
    );
    expect(html).not.toContain("<details");
    expect(html).not.toContain("<summary");
    expect(html).toContain('href="/"');
    expect(html).not.toContain('href="/uno"');
  });

  it("drops a whitespace-only slot from a submenu that has real entries (WR-07)", () => {
    const html = renderToStaticMarkup(
      <NavLink
        label="Servicios"
        child1Label="Uno"
        child1Url="/uno"
        child2Label=" "
        child2Url="/vacio"
      />,
    );
    expect(html).toContain("<details");
    const anchors = html.match(/<a\s/g) ?? [];
    expect(anchors).toHaveLength(1);
    expect(html).not.toContain('href="/vacio"');
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

  // WR-05. SiteHeader's slot applies `[&_a]:py-1 lg:[&_a]:py-0` to every
  // descendant anchor, so without an explicit floor these panel links collapse
  // to a ~20px text-sm hit target at lg: — under the 24x24 CSS-px minimum of
  // WCAG 2.5.8, which `lg:gap-2` (8px) does not close.
  it("gives every submenu anchor its own 24px target-size floor (WR-05)", () => {
    const html = renderToStaticMarkup(
      <NavLink
        label="Servicios"
        url="/servicios"
        child1Label="Uno"
        child1Url="/uno"
        child2Label="Dos"
        child2Url="/dos"
      />,
    );
    const anchors = html.match(/<a\s[^>]*>/g) ?? [];
    expect(anchors).toHaveLength(3);
    anchors.forEach((anchor) => {
      expect(anchor).toContain("min-h-6");
      expect(anchor).toContain("items-center");
    });
  });

  it("falls back to href=# for a child link with a label but no url", () => {
    const html = renderToStaticMarkup(
      <NavLink label="Servicios" child1Label="Sin URL" />,
    );
    expect(html).toContain('href="#"');
    expect(html).toContain("Sin URL");
  });

  // WR-06 / T-11-09. This block owns up to 9 merchant-controlled href sinks per
  // nav item (parent + 8 children) and site-header allows 8 nav items, so every
  // one of them routes through safeHref. Both branches must be covered — a
  // guard applied only to the submenu would leave the pre-existing bare-anchor
  // sink open.
  it("neutralizes a javascript: href in BOTH branches (WR-06)", () => {
    const bare = renderToStaticMarkup(
      <NavLink label="Inicio" url="javascript:alert(1)" />,
    );
    expect(bare).not.toContain("javascript:");
    expect(bare).toContain('href="#"');

    const submenu = renderToStaticMarkup(
      <NavLink
        label="Servicios"
        url="/servicios"
        child1Label="Malo"
        child1Url="javascript:alert(1)"
        child2Label="Peor"
        child2Url="  vbscript:msgbox(1)"
        child3Label="Aún peor"
        child3Url="data:text/html;base64,PHNjcmlwdD4="
      />,
    );
    expect(submenu).not.toContain("javascript:");
    expect(submenu).not.toContain("vbscript:");
    expect(submenu).not.toContain("data:text/html");
    // The safe parent destination is untouched.
    expect(submenu).toContain('href="/servicios"');
  });

  it("leaves every safe href byte-identical (WR-06)", () => {
    const html = renderToStaticMarkup(
      <NavLink
        label="Servicios"
        url="https://fixocargo.com/servicios?a=1"
        child1Label="Correo"
        child1Url="mailto:hola@fixocargo.com"
        child2Label="Ancla"
        child2Url="#contacto"
      />,
    );
    expect(html).toContain('href="https://fixocargo.com/servicios?a=1"');
    expect(html).toContain('href="mailto:hola@fixocargo.com"');
    expect(html).toContain('href="#contacto"');
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
