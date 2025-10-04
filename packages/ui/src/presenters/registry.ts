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

/**
 * The registry of components that can be replaced at runtime
 * by the apps consuming this library.
 */
export type PresenterRegistry = {
  DetailsBox: React.ComponentType<DetailsBoxProps>;
  ActivityItem: React.ComponentType<ActivityItemProps>;
  GameInfoTitleFigure: React.ComponentType<GameInfoTitleFigureProps>;
  GameInfoActions: React.ComponentType<GameInfoActionsProps>;
  TrendingReviewCard: React.ComponentType<ReviewCardProps>;
  CollectionThumbnailCard: React.ComponentType<CollectionThumbnailCardProps>;
  ProfileViewNavbarItem: React.ComponentType<ProfileViewNavbarItemProps>;
  GameAchievementsListItem: React.ComponentType<GameAchievementsListItemProps>;
};
