import React, { useState } from "react";
import { Box, SimpleGrid, Tabs } from "@mantine/core";
import { IconDeviceGamepad2, IconWriting } from "@tabler/icons-react";
import {
  AchievementsScreen,
  CenteredLoading,
  PostsListView,
  ProfileCollectionsPage,
  ProfileReviewListView,
  ProfileStatsView,
  ProfileViewNavbarItem,
  useAllObtainedAchievements,
  useCollectionEntriesForUserId,
  useReviewsForUserId,
  useUserLibrary,
  useUserProfile,
} from "#@/components";
import { ProfileViewMainPage } from "#@/components";
import { ProfileGamesListView } from "#@/components";

interface Props {
  userId: string;
}

/**
 * Component that renders a profile's tabs and it's contents
 * @param userId
 * @constructor
 */
const ProfileViewContent = ({ userId }: Props) => {
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const profileQuery = useUserProfile(userId);
  const libraryQuery = useUserLibrary(profileQuery.data?.userId);
  const collectionEntriesQuery = useCollectionEntriesForUserId(userId, 0, 1);
  const reviewsQuery = useReviewsForUserId(userId, 0, 1);
  const obtainedAchievementsQuery = useAllObtainedAchievements(userId);

  return (
    <Tabs
      unstyled
      allowTabDeactivation
      value={activeTab}
      onChange={(tab) => setActiveTab(tab)}
      className={"h-full w-full"}
    >
      <SimpleGrid
        cols={{
          base: 2,
          md: 8,
        }}
        className={"mb-6"}
      >
        <ProfileViewNavbarItem
          label={"Games"}
          value={"games"}
          count={collectionEntriesQuery.data?.pagination.totalItems ?? 0}
          activeTab={activeTab}
        />
        <ProfileViewNavbarItem
          label={"Reviews"}
          value={"reviews"}
          count={reviewsQuery.data?.pagination.totalItems ?? 0}
          activeTab={activeTab}
        />
        <ProfileViewNavbarItem
          label={"Collections"}
          value={"collections"}
          count={libraryQuery.data?.collections.length ?? 0}
          activeTab={activeTab}
        />
        <ProfileViewNavbarItem
          label={"Achievements"}
          value={"achievements"}
          count={obtainedAchievementsQuery.data?.length ?? 0}
          activeTab={activeTab}
        />
        <ProfileViewNavbarItem
          label={"Posts"}
          value={"posts"}
          icon={IconWriting}
          activeTab={activeTab}
        />
        <ProfileViewNavbarItem
          label={"View Stats"}
          value={"stats"}
          icon={IconDeviceGamepad2}
          activeTab={activeTab}
        />
      </SimpleGrid>

      <Tabs.Panel value="games">
        <ProfileGamesListView userId={userId} />
      </Tabs.Panel>
      <Tabs.Panel value="reviews">
        <ProfileReviewListView userId={userId} />
      </Tabs.Panel>
      <Tabs.Panel value="collections">
        <ProfileCollectionsPage userId={userId} />
      </Tabs.Panel>
      <Tabs.Panel value="achievements">
        <AchievementsScreen targetUserId={userId} withUserLevel={false} />
      </Tabs.Panel>
      <Tabs.Panel value="posts">
        <PostsListView profileUserId={userId} withUserProfile={false} />
      </Tabs.Panel>
      <Tabs.Panel value="stats">
        <ProfileStatsView userId={userId} withUserLevel={false} />
      </Tabs.Panel>

      {activeTab == null && <ProfileViewMainPage userId={userId} />}
    </Tabs>
  );
};

export { ProfileViewContent };
