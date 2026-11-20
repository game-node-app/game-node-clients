import type { ThemePackPresenters } from "#@/theme/packs/types";
// Direct file imports, not barrels: this object is built at module load, and the
// folder is excluded from barrelsby so it never reaches the default bundle.
import { ConsoleRecentBlogPosts } from "./ConsoleBlogSection";
import { ConsoleExplore } from "./ConsoleExplore";
import { ConsoleHome } from "./ConsoleHome";
import { ConsoleReleases } from "./ConsoleReleases";

/**
 * Console experience pack: the layout pieces that every console theme shares.
 * Theme screen packs (`theme/themes/<id>/screens`) only override what their
 * palette needs and import the reusable pieces from these files directly, so
 * no pack eagerly imports another.
 *
 * This file is intentionally not a barrelsby barrel: `packages/ui/barrelsby.json`
 * excludes `theme/experiences/console`, keeping the pack behind the lazy
 * loader in `theme/experiences/registry.ts`.
 */
export const presenters: ThemePackPresenters = {
  HomeView: ConsoleHome,
  HomeReleases: ConsoleReleases,
  RecentBlogPostsCarousel: ConsoleRecentBlogPosts,
  ExploreTrendingGames: ConsoleExplore,
};
