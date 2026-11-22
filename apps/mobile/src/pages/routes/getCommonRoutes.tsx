import React from "react";
import McpPage from "@/pages/mcp";
import { Route } from "react-router";
import GamePage from "@/pages/game";
import ProfilePage from "@/pages/profile/profile";
import ProfileStatsPage from "@/pages/profile/stats";
import ProfileReviewListPage from "@/pages/profile/review_list";
import AchievementsPage from "@/pages/feats";
import AuthPage from "@/pages/auth";
import ImporterPage from "@/pages/importer/importer";
import ImporterByTypePage from "@/pages/importer/source";
import ActivityPage from "@/pages/activity";
import ActivityDetailPage from "@/pages/activity/detail";
import { PostsPage } from "@/pages/posts.tsx";
import { BlogPostsPage } from "@/pages/blog";
import { BlogPostDetailPage } from "@/pages/blog/detail";
import { BlogPostsArchivePage } from "@/pages/blog/archive.tsx";
import CollectionEntryDetailPage from "@/pages/collection_entry.tsx";
import PreferencesPage from "@/pages/preferences.tsx";
import PreferencesSupporterPage from "@/pages/preferences_supporter";
import GameSearchPage from "@/pages/search.tsx";
import AwardsVotePage from "@/pages/awards/vote.tsx";
import AwardsNomineesPage from "@/pages/awards/nominees.tsx";
import LibraryPage from "@/pages/library/library";
import LibraryCollectionsPage from "@/pages/library/library_collections";
import CollectionPage from "@/pages/library/collection";
import CollectionReorderPage from "@/pages/library/collection_reorder";
import AwardsEventRedirectPage from "@/pages/awards";
import AwardsResultPage from "@/pages/awards/result";
import AwardsNominationsPage from "@/pages/awards/nominations";
import RecapStatsPage from "@/pages/recap/recap_stats";
import RecapStoriesPage from "@/pages/recap/stories";
import JournalAchievementsPage from "@/pages/journal/journal_achievements";
import { JournalPage } from "@/pages/journal/journal";
import ConnectionCallbackPage from "@/pages/connection_callback";
import DailyPage from "@/pages/daily";
import DailyPlayPage from "@/pages/daily/play";
import DailyArchivePage from "@/pages/daily/archive";
import DailyRankingPage from "@/pages/daily/ranking";
import DailyWeeklyPage from "@/pages/daily/weekly";
import DailyPracticePage from "@/pages/daily/practice";
import GuildPage from "@/pages/guild";

/**
 * Slugs accepted by the legacy `${prefix}/preferences/:category` deep link.
 * `supporter` is deliberately absent: it has its own exact route, and Ionic's
 * `IonRouterOutlet` keeps the **last** matching child, so a catch-all
 * `:category` registered after it would swallow `/preferences/supporter` and
 * render the Preferences list instead.
 */
const PREFERENCES_CATEGORIES = [
  "profile",
  "library",
  "connections",
  "importer",
  "auth",
  "misc",
  "account",
] as const;

/**
 * `:mode` for the Daily routes, limited to the modes. Ionic keeps the last
 * matching route, so `/daily/:mode` must not match `/daily/ranking` or
 * `/daily/weekly` whatever the order. Kept in sync with `DAILY_MODES`.
 */
export const DAILY_MODE_PARAM = ":mode(cover|artwork|keywords|specs)";

/** Path of the legacy `${prefix}/preferences/:category` deep link. */
export function getPreferencesCategoryPath(prefix: string) {
  return `${prefix}/preferences/:category(${PREFERENCES_CATEGORIES.join("|")})`;
}

/**
 * Retrieves a list of common routes that should be available in all tabs.
 * Most non-page routes should be declared here, as to not break tab layout navigation. <br>
 * Never route a user to another tab. <br>
 * Routes need to be direct children of 'IonTab's first 'IonRouterOutlet', otherwise they would break tabs navigation. <br>
 * Use 'getTabAwareHref' to retrieve a link to a common route based on the current selected tab.
 * @param prefix
 * @see getTabAwareHref
 */
export const BLOG_ROUTES = {
  feed: "/blog",
  archive: "/blog/archive",
  detail: "/blog/post/:postId",
} as const;

/**
 * Utility screens (setup, connections, settings, sign-in): they are reached from a menu or a
 * button, not from the tab bar, so the bar is hidden on them (see `Tabs`).
 */
export const UTILITY_ROUTES = {
  mcp: "/mcp",
  connectionCallback: "/connections/callback/:type",
  importer: "/importer",
  importerSource: "/importer/:source",
  auth: "/auth",
  preferences: "/preferences",
  preferencesSupporter: "/preferences/supporter",
} as const;

export function getCommonRoutes(prefix: string): React.ReactNode[] {
  return [
    <Route
      exact
      key={`${prefix}-daily`}
      path={`${prefix}/daily`}
      render={() => <DailyPage />}
    />,
    // Exact static routes must come before `/daily/:mode`.
    <Route
      exact
      key={`${prefix}-daily-ranking`}
      path={`${prefix}/daily/ranking`}
      render={() => <DailyRankingPage />}
    />,
    <Route
      exact
      key={`${prefix}-daily-weekly`}
      path={`${prefix}/daily/weekly`}
      render={() => <DailyWeeklyPage />}
    />,
    <Route
      exact
      key={`${prefix}-daily-play`}
      path={`${prefix}/daily/${DAILY_MODE_PARAM}`}
      render={({ match }) => <DailyPlayPage mode={match.params.mode} />}
    />,
    <Route
      exact
      key={`${prefix}-daily-archive`}
      path={`${prefix}/daily/${DAILY_MODE_PARAM}/archive`}
      render={({ match }) => <DailyArchivePage mode={match.params.mode} />}
    />,
    <Route
      exact
      key={`${prefix}-daily-practice`}
      path={`${prefix}/daily/${DAILY_MODE_PARAM}/practice`}
      render={({ match }) => <DailyPracticePage mode={match.params.mode} />}
    />,
    <Route
      exact
      key={`${prefix}-guild`}
      path={`${prefix}/guild`}
      render={() => <GuildPage />}
    />,
    <Route
      exact
      key={`${prefix}-mcp`}
      path={`${prefix}${UTILITY_ROUTES.mcp}`}
      render={() => <McpPage />}
    />,
    <Route
      exact
      key={`${prefix}-connection-callback`}
      path={`${prefix}${UTILITY_ROUTES.connectionCallback}`}
      render={({ match }) => (
        <ConnectionCallbackPage type={match.params.type} />
      )}
    />,
    <Route
      exact
      key={`${prefix}-game-search`}
      path={`${prefix}/search`}
      render={() => <GameSearchPage />}
    />,
    <Route
      key={`${prefix}-game`}
      path={`${prefix}/game/:id`}
      render={(props) => {
        // eslint-disable-next-line react/prop-types
        const routeId = props.match.params.id;
        const gameId = /^\d+$/.test(routeId) ? Number(routeId) : NaN;

        return <GamePage gameId={gameId} />;
      }}
    />,
    <Route
      exact
      key={`${prefix}-profile`}
      path={`${prefix}/profile/:userId`}
      render={(props) => {
        // eslint-disable-next-line react/prop-types
        const userId = props.match.params.userId;
        return <ProfilePage userId={userId} />;
      }}
    />,
    <Route
      key={`${prefix}-profile-stats`}
      path={`${prefix}/profile/:userId/stats`}
      render={(props) => {
        const userId = props.match.params.userId;
        return <ProfileStatsPage userId={userId} />;
      }}
    />,
    <Route
      key={`${prefix}-profile-reviews`}
      path={`${prefix}/profile/:userId/reviews`}
      render={(props) => {
        const userId = props.match.params.userId;

        return <ProfileReviewListPage userId={userId} />;
      }}
    />,
    <Route
      key={`${prefix}-journal-achievements`}
      path={`${prefix}/achievements/:userId`}
      render={(props) => {
        return <JournalAchievementsPage userId={props.match.params.userId} />;
      }}
    />,
    <Route
      key={`${prefix}-feats`}
      path={`${prefix}/feats/:userId`}
      render={(props) => {
        const userId = props.match.params.userId;
        return <AchievementsPage userId={userId} />;
      }}
    />,
    <Route
      exact
      key={`${prefix}-library`}
      path={`${prefix}/library/:userId`}
      render={(props) => {
        return <LibraryPage userId={props.match.params.userId} />;
      }}
    />,
    <Route
      exact
      key={`${prefix}-library-collections`}
      path={`${prefix}/library/:userId/collections`}
      render={(props) => {
        return <LibraryCollectionsPage userId={props.match.params.userId} />;
      }}
    />,
    <Route
      key={`${prefix}-library-collection`}
      path={`${prefix}/library/:userId/collection/:collectionId`}
      exact
      render={(props) => {
        return (
          <CollectionPage
            userId={props.match.params.userId}
            collectionId={props.match.params.collectionId}
          />
        );
      }}
    />,
    <Route
      key={`${prefix}-library-collection-reorder`}
      path={`${prefix}/library/:userId/collection/:collectionId/reorder`}
      exact
      render={(props) => {
        return (
          <CollectionReorderPage
            collectionId={props.match.params.collectionId}
          />
        );
      }}
    />,
    <Route
      key={`${prefix}-library-collection`}
      path={`${prefix}/library/:userId/collection/entry/:collectionEntryId`}
      render={(props) => {
        return (
          <CollectionEntryDetailPage
            userId={props.match.params.userId}
            collectionEntryId={props.match.params.collectionEntryId}
          />
        );
      }}
    />,
    <Route
      exact
      key={`${prefix}-importer`}
      path={`${prefix}${UTILITY_ROUTES.importer}`}
      render={() => <ImporterPage />}
    />,
    <Route
      key={`${prefix}-importer-type`}
      path={`${prefix}${UTILITY_ROUTES.importerSource}`}
      render={(props) => {
        // eslint-disable-next-line react/prop-types
        return <ImporterByTypePage source={props.match.params.source} />;
      }}
    />,
    <Route
      exact
      key={`${prefix}-auth`}
      path={`${prefix}${UTILITY_ROUTES.auth}`}
      render={() => <AuthPage />}
    />,
    <Route
      exact
      key={`${prefix}-activity`}
      path={`${prefix}/activity`}
      render={() => <ActivityPage />}
    />,
    <Route
      key={`${prefix}-activity-detail`}
      path={`${prefix}/activity/detail/:activityId`}
      render={(props) => {
        // eslint-disable-next-line react/prop-types
        return (
          <ActivityDetailPage activityId={props.match.params.activityId} />
        );
      }}
    />,
    <Route
      exact
      key={`${prefix}-posts`}
      path={`${prefix}/posts`}
      render={() => <PostsPage />}
    />,
    <Route
      exact
      key={`${prefix}-blog-posts`}
      path={`${prefix}${BLOG_ROUTES.feed}`}
      render={() => <BlogPostsPage />}
    />,
    <Route
      exact
      key={`${prefix}-blog-posts-archive`}
      path={`${prefix}${BLOG_ROUTES.archive}`}
      render={() => <BlogPostsArchivePage />}
    />,
    <Route
      exact
      key={`${prefix}-blog-post-detail`}
      path={`${prefix}${BLOG_ROUTES.detail}`}
      render={(props) => {
        return <BlogPostDetailPage postId={props.match.params.postId} />;
      }}
    />,
    <Route
      exact
      key={`${prefix}-preferences-supporter`}
      path={`${prefix}${UTILITY_ROUTES.preferencesSupporter}`}
      render={() => <PreferencesSupporterPage />}
    />,
    <Route
      exact
      key={`${prefix}-preferences-category`}
      path={getPreferencesCategoryPath(prefix)}
      render={() => <PreferencesPage />}
    />,
    <Route
      exact
      key={`${prefix}-preferences`}
      path={`${prefix}${UTILITY_ROUTES.preferences}`}
      render={() => <PreferencesPage />}
    />,
    <Route
      key={`${prefix}-journal`}
      path={`${prefix}/journal/:userId`}
      render={({ match }) => <JournalPage userId={match.params.userId} />}
    />,
    <Route
      key={`${prefix}-awards-redirect`}
      path={`${prefix}/awards/:eventYear`}
      exact
      render={(props) => {
        return (
          <AwardsEventRedirectPage eventYear={props.match.params.eventYear} />
        );
      }}
    />,
    <Route
      key={`${prefix}-awards-nominations`}
      path={`${prefix}/awards/:eventYear/nominations`}
      render={(props) => {
        return (
          <AwardsNominationsPage eventYear={props.match.params.eventYear} />
        );
      }}
    />,
    <Route
      key={`${prefix}-awards-vote`}
      path={`${prefix}/awards/:eventYear/vote`}
      render={(props) => {
        return <AwardsVotePage eventYear={props.match.params.eventYear} />;
      }}
    />,
    <Route
      key={`${prefix}-awards-result`}
      path={`${prefix}/awards/:eventYear/result`}
      render={(props) => {
        return <AwardsResultPage eventYear={props.match.params.eventYear} />;
      }}
    />,
    <Route
      key={`${prefix}-awards-nominees`}
      path={`${prefix}/awards/:eventYear/nominees/:userId`}
      render={(props) => {
        return (
          <AwardsNomineesPage
            eventYear={props.match.params.eventYear}
            userId={props.match.params.userId}
          />
        );
      }}
    />,
    <Route
      key={`${prefix}-recap-stats`}
      path={`${prefix}/recap/:year/:userId`}
      render={(props) => {
        const year = props.match.params.year;
        const userId = props.match.params.userId;
        return <RecapStatsPage year={parseInt(year)} userId={userId} />;
      }}
    />,
    // Registered after the Recap page: the outlet keeps the last matching
    // child, and the Recap route above is a prefix match.
    <Route
      key={`${prefix}-recap-stories`}
      path={`${prefix}/recap/:year/:userId/stories`}
      render={(props) => {
        const year = props.match.params.year;
        const userId = props.match.params.userId;
        return <RecapStoriesPage year={parseInt(year)} userId={userId} />;
      }}
    />,
  ];
}
