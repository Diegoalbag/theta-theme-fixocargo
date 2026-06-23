import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect } from "vitest";

import { BlocksSlot } from "@/lib/blocks-slot";

// Pins the BlocksSlot decision across all platform renderBlocks shapes.
// The vitest environment is `node` (no global document / JSDOM), so we render
// DOM-free with renderToStaticMarkup and assert on the returned HTML string.
// Test D is the exact case the old count-based guard got wrong: the customizer
// always returns a single slot-wrapper element, which must render as-is and
// never fall back to EmptyState. Test E pins the visible zero-blocks drop
// affordance the as-is branch now owns; Test F pins the WR-01 default parameter
// so an explicit empty={null} renders nothing.
describe("BlocksSlot", () => {
  it("Test A — renderBlocks undefined renders the EmptyState fallback (published-zero)", () => {
    const html = renderToStaticMarkup(<BlocksSlot renderBlocks={undefined} />);
    expect(html).toContain("Sin elementos");
  });

  it("Test B — renderBlocks returns [] renders the EmptyState fallback (published-zero)", () => {
    const html = renderToStaticMarkup(<BlocksSlot renderBlocks={() => []} />);
    expect(html).toContain("Sin elementos");
  });

  it("Test C — renderBlocks returns a populated array renders those elements, not the fallback", () => {
    const html = renderToStaticMarkup(
      <BlocksSlot
        renderBlocks={() => [
          <span key="a">BLOCK-A</span>,
          <span key="b">BLOCK-B</span>,
        ]}
      />,
    );
    expect(html).toContain("BLOCK-A");
    expect(html).toContain("BLOCK-B");
    expect(html).not.toContain("Sin elementos");
  });

  it("Test D — renderBlocks returns a single slot-wrapper element renders it, not the fallback (customizer)", () => {
    const html = renderToStaticMarkup(
      <BlocksSlot renderBlocks={() => <div>SLOT-WRAPPER</div>} />,
    );
    expect(html).toContain("SLOT-WRAPPER");
    expect(html).not.toContain("Sin elementos");
  });

  it("Test E — the as-is branch renders a visible dashed drop affordance with a hint (customizer-zero)", () => {
    const html = renderToStaticMarkup(
      <BlocksSlot renderBlocks={() => <div>SLOT-WRAPPER</div>} />,
    );
    expect(html).toContain("Arrastra bloques aquí");
    expect(html).toContain("border-dashed");
  });

  it("Test F — explicit empty={null} renders nothing for published-zero (WR-01)", () => {
    const html = renderToStaticMarkup(
      <BlocksSlot renderBlocks={undefined} empty={null} />,
    );
    expect(html).not.toContain("Sin elementos");
  });
});
