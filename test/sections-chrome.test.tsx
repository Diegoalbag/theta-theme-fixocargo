import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect } from "vitest";

import { AnnouncementBar, announcementBarSettingsSchema } from "@/sections/AnnouncementBar";

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

  it("renders locationLabel text when provided", () => {
    const html = renderToStaticMarkup(
      <AnnouncementBar locationLabel="Test Location" />,
    );
    expect(html).toContain("Test Location");
  });

  it("renders changeLabel text when provided", () => {
    const html = renderToStaticMarkup(
      <AnnouncementBar changeLabel="Test Change" />,
    );
    expect(html).toContain("Test Change");
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
