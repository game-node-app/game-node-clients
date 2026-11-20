import type { ThemePackPresenters } from "#@/theme/packs/types";
// Direct file imports, not barrels: this object is created at module load, and
// the folder is excluded from barrelsby so it stays behind the lazy loader.
import { XboxActivityItem } from "./XboxActivityItem";
import { XboxGameInfoView } from "./XboxGameInfoView";
import { XboxRecentBlogPostsCarousel } from "./XboxRecentBlogPostsCarousel";

/**
 * This wave's Xbox screens: activity rows, the game page and the home blog
 * block. `screens/index.ts` combines it with the profile/stats/posts pack.
 */
export const xboxGamePresenters: ThemePackPresenters = {
  ActivityItem: XboxActivityItem,
  GameInfoView: XboxGameInfoView,
  RecentBlogPostsCarousel: XboxRecentBlogPostsCarousel,
};
