// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HomeView } from "../../../../packages/ui/src/components/home/HomeView";
import { ExploreTrendingGames } from "../../../../packages/ui/src/components/explore/ExploreTrendingGames";
import { presenters } from "../../../../packages/ui/src/theme/experiences/console";
import { EXPERIENCE_PACK_LOADERS } from "../../../../packages/ui/src/theme/experiences/registry";

describe("console experience pack", () => {
  it("registers the console presenters", () => {
    expect(Object.keys(presenters).sort()).toEqual([
      "ExploreTrendingGames",
      "HomeReleases",
      "HomeView",
      "RecentBlogPostsCarousel",
    ]);
    for (const presenter of Object.values(presenters)) {
      expect(typeof presenter).toBe("function");
    }
  });

  it("loads through the lazy experience boundary", async () => {
    const pack = await EXPERIENCE_PACK_LOADERS.console();
    expect(pack.presenters.HomeView).toBe(presenters.HomeView);
    expect(pack.presenters.ExploreTrendingGames).toBe(
      presenters.ExploreTrendingGames,
    );
  });

  it("keeps the default HomeView rendering its sections unchanged", () => {
    const { container, rerender } = render(
      <HomeView>
        <span>sections</span>
      </HomeView>,
    );
    expect(container.textContent).toBe("sections");

    // The caller keeps search and extras inside its own sections for the
    // default layout, so the experience-only slots must not duplicate them.
    rerender(
      <HomeView search={<span>search</span>} extras={<span>extras</span>}>
        <span>sections</span>
      </HomeView>,
    );
    expect(container.textContent).toBe("sections");
    expect(screen.getByText("sections")).toBeTruthy();
    expect(screen.queryByText("search")).toBeNull();
    expect(screen.queryByText("extras")).toBeNull();
  });

  it("keeps the default explore content rendering its children unchanged", () => {
    const { container, rerender } = render(
      <ExploreTrendingGames>
        <span>content</span>
      </ExploreTrendingGames>,
    );
    expect(container.textContent).toBe("content");

    // The platform content already includes filters and pagination; the
    // console-only slots are not rendered by the default.
    rerender(
      <ExploreTrendingGames
        filters={<span>filters</span>}
        results={<span>results</span>}
        filtered
      >
        <span>content</span>
      </ExploreTrendingGames>,
    );
    expect(container.textContent).toBe("content");
    expect(screen.queryByText("filters")).toBeNull();
    expect(screen.queryByText("results")).toBeNull();
  });
});
