import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect } from "vitest";

import {
  DecorativeBackdrop,
  decorativeBackdropSettingsSchema,
} from "@/sections/DecorativeBackdrop";
import { sectionBlocksConfig } from "@/registry";

// Behavioral smoke tests for the quick-task DecorativeBackdrop section
// (260709-buk). The vitest environment is `node` (no global document), so we
// render DOM-free with renderToStaticMarkup and assert only on the returned
// HTML string. These prove the component renders without crashing and emits
// the correct structure — the registry-driven empty-state matrix pins the
// census; this file locks the per-component behavior that the matrix cannot
// express.

describe("DecorativeBackdrop", () => {
  it("without image: renders no <img> tag but a non-empty aria-hidden zero-height wrapper", () => {
    const html = renderToStaticMarkup(<DecorativeBackdrop />);
    expect(html).not.toContain("<img");
    expect(html.length).toBeGreaterThan(0);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("h-0");
    expect(html).toContain("overflow-visible");
    expect(html).toContain("pointer-events-none");
    expect(html).toContain("relative");
  });

  it("with image: renders exactly one correctly-attributed <img>", () => {
    const html = renderToStaticMarkup(
      <DecorativeBackdrop
        image={{
          id: "1",
          url: "https://example.com/x.svg",
          width: 400,
          height: 800,
        }}
      />,
    );
    const matches = html.match(/<img/g) ?? [];
    expect(matches).toHaveLength(1);
    expect(html).toContain('src="https://example.com/x.svg"');
    expect(html).toContain('width="400"');
    expect(html).toContain('height="800"');
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('decoding="async"');
    expect(html).toContain("absolute");
    expect(html).toContain("top-0");
    expect(html).toContain("object-contain");
  });

  it("default settings + image: style contains height:100vh, width:600px, opacity:1, left:50%, translateX(calc(-50% + 0px))", () => {
    const html = renderToStaticMarkup(
      <DecorativeBackdrop
        image={{ id: "1", url: "https://example.com/x.svg" }}
      />,
    );
    expect(html).toContain("height:100vh");
    expect(html).toContain("width:600px");
    expect(html).toContain("opacity:1");
    expect(html).toContain("left:50%");
    expect(html).toContain("transform:translateX(calc(-50% + 0px))");
  });

  it('horizontalPosition="left": style contains left:0px and transform:translateX(0px), no right: or 50%', () => {
    const html = renderToStaticMarkup(
      <DecorativeBackdrop
        image={{ id: "1", url: "https://example.com/x.svg" }}
        horizontalPosition="left"
      />,
    );
    expect(html).toContain("left:0px");
    expect(html).toContain("transform:translateX(0px)");
    expect(html).not.toContain("right:");
    expect(html).not.toContain("50%");
  });

  it('horizontalPosition="right" with horizontalOffset=-30: style contains right:0px and transform:translateX(-30px)', () => {
    const html = renderToStaticMarkup(
      <DecorativeBackdrop
        image={{ id: "1", url: "https://example.com/x.svg" }}
        horizontalPosition="right"
        horizontalOffset={-30}
      />,
    );
    expect(html).toContain("right:0px");
    expect(html).toContain("transform:translateX(-30px)");
  });

  it('horizontalPosition="center" with horizontalOffset=40: style contains transform:translateX(calc(-50% + 40px))', () => {
    const html = renderToStaticMarkup(
      <DecorativeBackdrop
        image={{ id: "1", url: "https://example.com/x.svg" }}
        horizontalPosition="center"
        horizontalOffset={40}
      />,
    );
    expect(html).toContain("transform:translateX(calc(-50% + 40px))");
  });

  it("decorativeBackdropSettingsSchema has exactly 6 entries in order with correct shape", () => {
    expect(decorativeBackdropSettingsSchema).toHaveLength(6);
    const ids = decorativeBackdropSettingsSchema.map((s) => s.id);
    expect(ids).toEqual([
      "image",
      "reachVh",
      "horizontalPosition",
      "horizontalOffset",
      "widthPx",
      "opacity",
    ]);

    const image = decorativeBackdropSettingsSchema.find(
      (s) => s.id === "image",
    );
    expect(image?.type).toBe("image_picker");

    const reachVh = decorativeBackdropSettingsSchema.find(
      (s) => s.id === "reachVh",
    );
    expect(reachVh?.type).toBe("range");
    expect(reachVh).toMatchObject({ min: 20, max: 300, step: 10, default: 100 });

    const horizontalPosition = decorativeBackdropSettingsSchema.find(
      (s) => s.id === "horizontalPosition",
    );
    expect(horizontalPosition?.type).toBe("select");
    expect(horizontalPosition?.options).toHaveLength(3);
    expect(horizontalPosition?.options?.map((o) => o.value)).toEqual([
      "left",
      "center",
      "right",
    ]);
    expect(horizontalPosition?.default).toBe("center");

    const horizontalOffset = decorativeBackdropSettingsSchema.find(
      (s) => s.id === "horizontalOffset",
    );
    expect(horizontalOffset?.type).toBe("number");
    expect(horizontalOffset?.default).toBe(0);

    const widthPx = decorativeBackdropSettingsSchema.find(
      (s) => s.id === "widthPx",
    );
    expect(widthPx?.type).toBe("number");
    expect(widthPx?.default).toBe(600);

    const opacity = decorativeBackdropSettingsSchema.find(
      (s) => s.id === "opacity",
    );
    expect(opacity?.type).toBe("range");
    expect(opacity).toMatchObject({ min: 0, max: 100, step: 5, default: 100 });
  });
});

describe("registry wiring", () => {
  it("decorative-backdrop has NO sectionBlocksConfig entry (no-block section)", () => {
    expect(sectionBlocksConfig["decorative-backdrop"]).toBeUndefined();
  });
});
