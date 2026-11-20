// @vitest-environment node
import { describe, expect, it } from "vitest";
import { presenters } from "../../../../packages/ui/src/theme/experiences/console";

/**
 * The console pack is imported on the server for SSR pages. Module evaluation
 * must not touch `window`/`document`; browser APIs stay inside effects.
 */
describe("console experience SSR import", () => {
  it("evaluates the pack without a DOM", () => {
    expect(typeof window).toBe("undefined");
    expect(typeof document).toBe("undefined");
    expect(presenters.HomeView).toBeTypeOf("function");
    expect(presenters.HomeReleases).toBeTypeOf("function");
    expect(presenters.ExploreTrendingGames).toBeTypeOf("function");
    expect(presenters.RecentBlogPostsCarousel).toBeTypeOf("function");
  });
});
