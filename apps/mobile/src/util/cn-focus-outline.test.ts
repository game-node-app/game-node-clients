import { describe, expect, it } from "vitest";
import { cn } from "../../../../packages/ui/src/util/cn";

/**
 * `cn` (tailwind-merge) treats the bare `outline` utility as the outline
 * style, so a following `outline-2` removes it and the browser falls back to
 * its automatic focus ring. The Dock, Topbar and notification components use
 * the arbitrary `outline-style` declaration, which the merge preserves.
 */
describe("cn focus outline", () => {
  it("keeps the solid outline style next to the width and brand color", () => {
    const merged = cn(
      "focus-visible:[outline-style:solid]",
      "focus-visible:outline-2",
      "focus-visible:outline-brand-5",
    );

    expect(merged).toContain("focus-visible:[outline-style:solid]");
    expect(merged).toContain("focus-visible:outline-2");
    expect(merged).toContain("focus-visible:outline-brand-5");
  });

  it("documents why the bare outline utility is not enough", () => {
    const merged = cn(
      "focus-visible:outline",
      "focus-visible:outline-2",
      "focus-visible:outline-brand-5",
    );

    expect(merged).not.toContain("focus-visible:outline ");
  });
});
