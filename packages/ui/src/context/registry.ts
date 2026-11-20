import React from "react";
import type { SupportedLanguage } from "@repo/locales";
import {
  ActivityItemProps,
  CollectionThumbnailCardProps,
  DetailsBoxProps,
  GameAchievementsListItemProps,
  GameInfoActionsProps,
  GameInfoTitleFigureProps,
  ReviewCardProps,
} from "#@/components";
import {
  LinkComponentProps,
  ModalComponentProps,
  RouterHookProps,
} from "#@/util";
import { UseScrollPositionReturn } from "#@/components/general/hooks/useScrollPosition";
import type { ExploreTrendingGamesProps } from "#@/components/explore/ExploreTrendingGames";
import type { GameInfoViewProps } from "#@/components/game/info/GameInfoView";
import type { HomeViewProps } from "#@/components/home/HomeView";
import type { ReleaseStrip } from "#@/components/home/ReleaseStrip";
import type { NotificationsPanelProps } from "#@/components/notifications/view/NotificationsPanel";
import type { PostsFeedViewProps } from "#@/components/posts/feed/PostsFeedView";
import type { PostsListItemProps } from "#@/components/posts/PostsListItem";
import type { ProfileStatsViewProps } from "#@/components/profile/view/stats/ProfileStatsView";
import type { ProfileStatsSimpleOverviewProps } from "#@/components/profile/view/ProfileStatsSimpleOverview";
import type { ProfileUserInfoWithBannerProps } from "#@/components/profile/view/ProfileUserInfoWithBanner";
import type { ProfileViewNavbarItemProps } from "#@/components/profile/view/navbar/ProfileViewNavbarItem";
import type { ThemeStorage } from "#@/theme/runtime";

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
  GameAchievementsListItem: React.ComponentType<GameAchievementsListItemProps>;
  /**
   * Themeable screens. The defaults are today's components; an experience or
   * theme screen pack loaded by `AppThemeProvider` can replace any of them.
   * App platform presenters win over packs (Ionic modals/links keep working).
   */
  GameInfoView: React.ComponentType<GameInfoViewProps>;
  ProfileUserInfoWithBanner: React.ComponentType<ProfileUserInfoWithBannerProps>;
  ProfileViewNavbarItem: React.ComponentType<ProfileViewNavbarItemProps>;
  ProfileStatsSimpleOverview: React.ComponentType<ProfileStatsSimpleOverviewProps>;
  ProfileStatsView: React.ComponentType<ProfileStatsViewProps>;
  RecentBlogPostsCarousel: React.ComponentType;
  HomeView: React.ComponentType<HomeViewProps>;
  HomeReleases: React.ComponentType<React.ComponentProps<typeof ReleaseStrip>>;
  ExploreTrendingGames: React.ComponentType<ExploreTrendingGamesProps>;
  PostsListItem: React.ComponentType<PostsListItemProps>;
  PostsFeedView: React.ComponentType<PostsFeedViewProps>;
  NotificationsPanel: React.ComponentType<NotificationsPanelProps>;
  BlogArticleLanguageLink: React.ComponentType<{
    href: string;
    locale: SupportedLanguage;
    render: (
      props: { lang: SupportedLanguage } & (
        | { component: "a"; href: string; hrefLang: SupportedLanguage }
        | { component: "button"; type: "button"; onClick: () => void }
      ),
    ) => React.ReactElement;
  }>;
  Link: React.ComponentType<LinkComponentProps>;
  Modal: React.ComponentType<ModalComponentProps>;
};

/**
 * What a caller wants to share: a locally generated file plus the copy that
 * goes with it. Apps only decide *how* to open the share sheet.
 */
export type ShareFilePayload = {
  file: File;
  /** Subject/title of the share. */
  title: string;
  /** Body text, usually including the page URL. */
  text: string;
  /** Canonical URL of the page the file belongs to. */
  url: string;
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
   * Opens the native share sheet for a locally generated file (e.g. a game card
   * image). Resolves to `false` when the user dismissed it and rejects when
   * sharing isn't available, so callers can fall back.
   * Defaults to the Web Share API.
   */
  shareFile?: (payload: ShareFilePayload) => Promise<boolean>;
  /**
   * Opens an external URL such as a Stripe Checkout or Customer Portal session.
   * Defaults to `window.location.assign`; native apps can override it with an
   * in-app browser (`Browser.open` on mobile).
   */
  openExternalUrl?: (url: string) => Promise<void> | void;
  /**
   * Per-device theme persistence (cookie/localStorage on web, Capacitor
   * Preferences on mobile). Apps without one (admin) keep the default theme.
   */
  themeStorage?: ThemeStorage;
};
