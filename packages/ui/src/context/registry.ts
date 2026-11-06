import React from "react";
import {
  ActivityItemProps,
  CollectionThumbnailCardProps,
  DetailsBoxProps,
  ExploreTrendingGamesProps,
  GameAchievementsListItemProps,
  GameInfoActionsProps,
  GameInfoTitleFigureProps,
  GameInfoViewProps,
  ProfileUserInfoProps,
  ProfileUserInfoWithBannerProps,
  ProfileStatsSimpleOverviewProps,
  ProfileStatsViewProps,
  ProfileViewNavbarItemProps,
  PostsFeedViewProps,
  PostsListItemProps,
  ReviewCardProps,
} from "#@/components";
import {
  LinkComponentProps,
  ModalComponentProps,
  RouterHookProps,
} from "#@/util";
import { UseScrollPositionReturn } from "#@/components/general/hooks/useScrollPosition";

/**
 * The registry of components that can be replaced at runtime
 * by the apps consuming this library, or by the active app theme (THEMES in components/theme/registry.ts).
 */
export type UIPresenterRegistry = {
  DetailsBox: React.ComponentType<DetailsBoxProps>;
  ActivityItem: React.ComponentType<ActivityItemProps>;
  GameInfoTitleFigure: React.ComponentType<GameInfoTitleFigureProps>;
  GameInfoActions: React.ComponentType<GameInfoActionsProps>;
  TrendingReviewCard: React.ComponentType<ReviewCardProps>;
  CollectionThumbnailCard: React.ComponentType<CollectionThumbnailCardProps>;
  ProfileViewNavbarItem: React.ComponentType<ProfileViewNavbarItemProps>;
  GameAchievementsListItem: React.ComponentType<GameAchievementsListItemProps>;
  Link: React.ComponentType<LinkComponentProps>;
  Modal: React.ComponentType<ModalComponentProps>;
  ProfileUserInfo: React.ComponentType<ProfileUserInfoProps>;
  ProfileUserInfoWithBanner: React.ComponentType<ProfileUserInfoWithBannerProps>;
  ProfileStatsSimpleOverview: React.ComponentType<ProfileStatsSimpleOverviewProps>;
  ProfileStatsView: React.ComponentType<ProfileStatsViewProps>;
  RecentBlogPostsCarousel: React.ComponentType<Record<string, never>>;
  HomeReleases: React.ComponentType<Record<string, never>>;
  ExploreTrendingGames: React.ComponentType<ExploreTrendingGamesProps>;
  GameInfoView: React.ComponentType<GameInfoViewProps>;
  PostsListItem: React.ComponentType<PostsListItemProps>;
  PostsFeedView: React.ComponentType<PostsFeedViewProps>;
};

/**
 * The hook regitry should only be used when a hook cannot be consumed directly by the @repo/ui package.
 * Example: useRouter, which would be a framework-specific hook, could cause issues if used in the shared package.
 */
export type UIHookRegistry = {
  useRouter: () => RouterHookProps;
  useScrollPosition?: () => UseScrollPositionReturn;
  /** Whether a cached page is active. Defaults to true. */
  useIsViewActive?: () => boolean;
  /** Route of the sign-in screen. Defaults to `/auth`. */
  authPath?: string;
};
