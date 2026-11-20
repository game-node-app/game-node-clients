import type { ThemePackPresenters } from "#@/theme/packs/types";
// Direct file imports, not barrels: this object is built at module load, so its
// components must already be evaluated. The pack entry imports and spreads it.
import { XboxPostsFeedView } from "./XboxPostsFeedView";
import { XboxPostsListItem } from "./XboxPostsListItem";
import { XboxProfileStats } from "./XboxProfileStats";
import { XboxProfileStatsView } from "./XboxProfileStatsView";
import { XboxProfileView } from "./XboxProfileView";
import { XboxProfileViewNavbarItem } from "./XboxProfileViewNavbarItem";

/**
 * The community half of the Xbox screen pack (profile, stats and posts). The
 * pack entry point combines it with the activity/game/blog presenters, so this
 * module never imports another agent's screens.
 */
export const xboxCommunityPresenters: ThemePackPresenters = {
  ProfileUserInfoWithBanner: XboxProfileView,
  ProfileViewNavbarItem: XboxProfileViewNavbarItem,
  ProfileStatsSimpleOverview: XboxProfileStats,
  ProfileStatsView: XboxProfileStatsView,
  PostsListItem: XboxPostsListItem,
  PostsFeedView: XboxPostsFeedView,
};
