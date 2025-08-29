import React from "react";
import { Route } from "react-router";
import GamePage from "@/pages/game";
import ProfilePage from "@/pages/profile/profile";
import ProfileStatsPage from "@/pages/profile/stats";
import ProfileReviewListPage from "@/pages/profile/review_list";
import AchievementsPage from "@/pages/achievements";
import LibraryPage from "@/pages/library";
import SupertokensAuthPage from "@/pages/auth";
import ImporterPage from "@/pages/importer/importer";
import ImporterByTypePage from "@/pages/importer/source";
import ActivityPage from "@/pages/activity";
import ActivityDetailPage from "@/pages/activity/detail";
import { PostsPage } from "@/pages/posts.tsx";
import { BlogPostsPage } from "@/pages/blog";
import { BlogPostDetailPage } from "@/pages/blog/detail";
import { BlogPostsArchivePage } from "@/pages/blog/archive.tsx";
import CollectionEntryDetailPage from "@/pages/collection_entry.tsx";
import CollectionPage from "@/pages/collection.tsx";
import PreferencesPage from "@/pages/preferences.tsx";

/**
 * Retrieves a list of common routes that should be available in all tabs.
 * Most non-page routes should be declared here, as to not break tab layout navigation. <br>
 * Never route a user to another tab. <br>
 * Routes need to be direct children of 'IonTab's first 'IonRouterOutlet', otherwise they would break tabs navigation. <br>
 * Use 'getTabAwareHref' to retrieve a link to a common route based on the current selected tab.
 * @param prefix
 * @see getTabAwareHref
 */
export function getCommonRoutes(prefix: string): React.ReactNode[] {
  return [
    <Route
      key={`${prefix}-game`}
      path={`${prefix}/game/:id`}
      render={(props) => {
        // eslint-disable-next-line react/prop-types
        const gameId = Number.parseInt(props.match.params.id);

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
      key={`${prefix}-achievements`}
      path={`${prefix}/achievements/:userId`}
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
      path={`${prefix}/importer`}
      render={() => <ImporterPage />}
    />,
    <Route
      key={`${prefix}-importer-type`}
      path={`${prefix}/importer/:source`}
      render={(props) => {
        // eslint-disable-next-line react/prop-types
        return <ImporterByTypePage source={props.match.params.source} />;
      }}
    />,
    <Route
      exact
      key={`${prefix}-auth`}
      path={`${prefix}/auth`}
      render={() => <SupertokensAuthPage />}
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
      path={`${prefix}/blog`}
      render={() => <BlogPostsPage />}
    />,
    <Route
      key={`${prefix}-blog-posts-archive`}
      path={`${prefix}/blog/archive`}
      render={() => <BlogPostsArchivePage />}
    />,
    <Route
      key={`${prefix}-blog-post-detail`}
      path={`${prefix}/blog/post/:postId`}
      render={(props) => {
        return <BlogPostDetailPage postId={props.match.params.postId} />;
      }}
    />,
    <Route
      key={`${prefix}-preferences`}
      path={`${prefix}/preferences`}
      render={() => <PreferencesPage />}
    />,
  ];
}
