// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  preloadThemePack,
  themePackStore,
} from "../../../../packages/ui/src/theme/packs/defaults";

describe("Xbox screen pack", () => {
  // The first import also transforms both packs and their UI dependencies in Vitest.
  it("loads all Xbox presenters on demand without a DOM", async () => {
    expect(typeof window).toBe("undefined");
    expect(typeof document).toBe("undefined");

    await preloadThemePack("gamenode");
    expect(themePackStore.peek("experience", "console")).toBeUndefined();
    expect(themePackStore.peek("screens", "xbox")).toBeUndefined();

    await preloadThemePack("xbox");
    expect(themePackStore.getError("experience", "console")).toBeNull();
    expect(themePackStore.getError("screens", "xbox")).toBeNull();
    const consolePack = themePackStore.peek("experience", "console");
    const xboxPack = themePackStore.peek("screens", "xbox");
    expect(consolePack?.presenters.HomeView).toBeTypeOf("function");
    expect(Object.keys(xboxPack?.presenters ?? {}).sort()).toEqual([
      "ActivityItem",
      "GameInfoView",
      "PostsFeedView",
      "PostsListItem",
      "ProfileStatsSimpleOverview",
      "ProfileStatsView",
      "ProfileUserInfoWithBanner",
      "ProfileViewNavbarItem",
      "RecentBlogPostsCarousel",
    ]);
    for (const presenter of Object.values(xboxPack?.presenters ?? {})) {
      expect(presenter).toBeTypeOf("function");
    }
  }, 120_000);
});
