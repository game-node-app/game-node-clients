import { describe, expect, it } from "vitest";
import { THEMES } from "../../../../packages/ui/src";

describe("app theme registry", () => {
  // a presenter that is undefined after the package loads means an import cycle reached it before it was defined
  it("loads every theme's presenters through the package entry", () => {
    for (const [theme, definition] of Object.entries(THEMES)) {
      for (const [name, presenter] of Object.entries(
        definition.presenters ?? {},
      )) {
        expect(presenter, `${theme}.${name}`).toBeTypeOf("function");
      }
    }
    expect(Object.keys(THEMES.xbox.presenters ?? {})).toEqual([
      "ActivityItem",
      "RecentBlogPostsCarousel",
      "HomeReleases",
      "ExploreTrendingGames",
      "GameInfoView",
      "ProfileUserInfoWithBanner",
      "ProfileViewNavbarItem",
      "ProfileStatsSimpleOverview",
      "ProfileStatsView",
    ]);
  });
});
