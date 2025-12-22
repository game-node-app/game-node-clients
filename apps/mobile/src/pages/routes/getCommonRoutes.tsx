import React from "react";
import { Route } from "react-router";
import GamePage from "@/pages/game";
import ProfilePage from "@/pages/profile/profile";
import ProfileStatsPage from "@/pages/profile/stats";
import ProfileReviewListPage from "@/pages/profile/review_list";
import AchievementsPage from "@/pages/achievements";
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
import PreferencesPage from "@/pages/preferences.tsx";
import { JournalPage } from "@/pages/journal.tsx";
import GameSearchPage from "@/pages/search.tsx";
import AwardsVotePage from "@/pages/awards/vote.tsx";
import AwardsNomineesPage from "@/pages/awards/nominees.tsx";
import LibraryPage from "@/pages/library/library";
import LibraryCollectionsPage from "@/pages/library/library_collections";
import CollectionPage from "@/pages/library/collection";
import CollectionReorderPage from "@/pages/library/collection_reorder";
import AwardsEventRedirectPage from "@/pages/awards";
import AwardsResultPage from "@/pages/awards/result";

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
  ];
}
