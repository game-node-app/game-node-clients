import React from "react";
import {
  ActivityItemProps,
  CollectionThumbnailCardProps,
  DetailsBoxProps,
  GameAchievementsListItemProps,
  GameInfoActionsProps,
  GameInfoTitleFigureProps,
  ProfileUserInfoProps,
  ProfileViewNavbarItemProps,
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
  ProfileUserInfo: React.ComponentType<ProfileUserInfoProps>;
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
  /** Route of the settings Supporter surface. Defaults to `/home?settings=premium`. */
  supporterSettingsHref?: string;
  /**
   * Whether game reads opt in to the viewer's custom covers. Defaults to `true`;
   * apps that must always show default covers (admin) set it to `false`.
   */
  personalizeGameCovers?: boolean;
  /**
   * Opens the native share sheet for a text. Resolves to `false` when the user
   * dismissed it and rejects when sharing isn't available, so callers can fall back.
   * Defaults to the Web Share API.
   */
  shareText?: (text: string) => Promise<boolean>;
  /**
   * Opens an external URL such as a Stripe Checkout or Customer Portal session.
   * Defaults to `window.location.assign`; native apps can override it with an
   * in-app browser (`Browser.open` on mobile).
   */
  openExternalUrl?: (url: string) => Promise<void> | void;
};
