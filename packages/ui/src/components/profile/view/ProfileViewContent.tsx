import React, { useMemo } from "react";
import { SimpleGrid, Tabs } from "@mantine/core";
import {
  IconDeviceGamepad2,
  IconNotebook,
  IconWriting,
} from "@tabler/icons-react";
import {
  AchievementsScreen,
  JournalOverviewView,
  PostsListView,
  ProfileCollectionsPage,
  ProfileGamesListView,
  ProfileReviewListView,
  ProfileStatsView,
  ProfileViewMainPage,
  ProfileViewNavbarItem,
  useAllObtainedAchievements,
  useCollectionEntriesForUserId,
  useReviewsForUserId,
  useUserLibrary,
  useUserProfile,
} from "#@/components";
import { useRouter } from "#@/util";

interface Props {
  userId: string;
}

/**
 * Component that renders a profile's tabs and it's contents
 */
const ProfileViewContent = ({ userId }: Props) => {
  const router = useRouter();
  const query = router.query;

  const profileQuery = useUserProfile(userId);
  const libraryQuery = useUserLibrary(profileQuery.data?.userId);
  const collectionEntriesQuery = useCollectionEntriesForUserId(userId, 0, 1);
  const reviewsQuery = useReviewsForUserId(userId, 0, 1);
  const obtainedAchievementsQuery = useAllObtainedAchievements(userId);

  const activeTab = useMemo(() => {
    const tabQuery = query.get("tab");
    if (tabQuery == null || tabQuery.length === 0) return null;
    return tabQuery;
  }, [query]);

  const onTabChange = (tab: string | null) => {
    router.push(`${router.pathname}?tab=${tab ?? ""}`, {
      replace: true,
      scroll: false,
      shallow: true,
    });
  };

  return (
    <Tabs
      unstyled
      allowTabDeactivation
      value={query.get("tab")}
      onChange={(tab) => onTabChange(tab)}
      className={"h-full w-full"}
      // Render content on demand, saves up some network calls
      keepMounted={false}
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
          label={"Journal"}
          activeTab={activeTab}
          value={"journal"}
          icon={IconNotebook}
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
      <Tabs.Panel value="journal">
        <JournalOverviewView userId={userId} />
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
