import React from "react";
import {
  ActivityItemProps,
  CollectionThumbnailCardProps,
  DetailsBoxProps,
  GameAchievementsListItemProps,
  GameInfoActionsProps,
  GameInfoTitleFigureProps,
  ProfileViewNavbarItemProps,
  ReviewCardProps,
} from "#@/components";
import {
  LinkComponentProps,
  ModalComponentProps,
  RouterHookProps,
} from "#@/util";

/**
 * The registry of components that can be replaced at runtime
 * by the apps consuming this library.
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
};

/**
 * The hook regitry should only be used when a hook cannot be consumed directly by the @repo/ui package.
 * Example: useRouter, which would be a framework-specific hook, could cause issues if used in the shared package.
 */
export type UIHookRegistry = {
  useRouter: () => RouterHookProps;
};
