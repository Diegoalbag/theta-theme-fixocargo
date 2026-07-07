import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect } from "vitest";

import { AnnouncementBar, announcementBarSettingsSchema } from "@/sections/AnnouncementBar";
import { SiteHeader, siteHeaderSettingsSchema } from "@/sections/SiteHeader";
import { Footer, footerSettingsSchema } from "@/sections/Footer";

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

  it("siteHeaderSettingsSchema has exactly 3 entries", () => {
    expect(siteHeaderSettingsSchema).toHaveLength(3);
  });

  it("siteHeaderSettingsSchema ids are logo, accountLabel, accountUrl", () => {
    const ids = siteHeaderSettingsSchema.map((s) => s.id);
    expect(ids).toEqual(["logo", "accountLabel", "accountUrl"]);
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
