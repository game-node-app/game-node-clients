import type { UIPresenterRegistry } from "#@/context/registry";
// direct file imports, not barrels: this object is built at module load, so its components must already be evaluated
import { ConsoleExplore } from "#@/components/theme/console/ConsoleExplore";
import { ConsoleReleases } from "#@/components/theme/console/ConsoleReleases";
import { XboxActivityItem } from "./XboxActivityItem";
import { XboxGameInfoView } from "./XboxGameInfoView";
import { XboxRecentBlogPostsCarousel } from "./XboxRecentBlogPostsCarousel";

export const xboxPresenters: Partial<UIPresenterRegistry> = {
  ActivityItem: XboxActivityItem,
  RecentBlogPostsCarousel: XboxRecentBlogPostsCarousel,
  HomeReleases: ConsoleReleases,
  ExploreTrendingGames: ConsoleExplore,
  GameInfoView: XboxGameInfoView,
};
