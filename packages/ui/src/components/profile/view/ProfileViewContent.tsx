import {
  AchievementsScreen,
  JournalObtainedAchievementsView,
  JournalOverviewView,
  LibraryHiddenState,
  PostsListView,
  ProfileCollectionsPage,
  ProfileGamesListView,
  ProfileReviewListView,
  useIsLibraryHidden,
  useReviewsForUserId,
  useUserLibrary,
  useUserProfile,
} from "#@/components";
import { useCollectionEntriesForUserId } from "#@/components/collection/collection-entry/hooks/useCollectionEntriesForUserId";
import { useObtainedGameAchievements } from "#@/components/game/achievement/hooks/useObtainedGameAchievements";
import { filterVisibleCollections } from "#@/components/library/util/filterVisibleCollections";
import { useInfinitePosts } from "#@/components/posts/hooks/useInfinitePosts";
import { ProfileUserInfoWithBanner } from "#@/components/profile/view/ProfileUserInfoWithBanner";
import { ProfileViewNavbarItem } from "#@/components/profile/view/navbar/ProfileViewNavbarItem";
import { ProfileViewMainPage } from "#@/components/profile/view/pages/ProfileViewMainPage";
import { ProfileStatsView } from "#@/components/profile/view/stats/ProfileStatsView";
import { useRouter } from "#@/util";
import { buildPresenterComponent } from "#@/context";
import { Box, Button, Divider, Stack } from "@mantine/core";
import { useI18nContext, useTranslation } from "@repo/locales";
import { IconArrowLeft } from "@tabler/icons-react";
import { useEffect, useRef } from "react";

const ProfileUserInfoPresenter = buildPresenterComponent(
  "ProfileUserInfoWithBanner",
  (props) => <ProfileUserInfoWithBanner {...props} />,
);
const ProfileNavbarItemPresenter = buildPresenterComponent(
  "ProfileViewNavbarItem",
  (props) => <ProfileViewNavbarItem {...props} />,
);
const ProfileStatsPresenter = buildPresenterComponent(
  "ProfileStatsView",
  (props) => <ProfileStatsView {...props} />,
);

const PROFILE_TABS = [
  "games",
  "reviews",
  "posts",
  "collections",
  "achievements",
  "feats",
  "journal",
  "stats",
] as const;
export type ProfileTab = (typeof PROFILE_TABS)[number];
const REVIEW_PREVIEW_LIMIT = 6;

const ProfileViewContent = ({ userId }: { userId: string }) => {
  const { t } = useTranslation();
  const { language } = useI18nContext();
  const router = useRouter();
  const rawTab = router.query.get("tab");
  const tab = PROFILE_TABS.find((item) => item === rawTab) ?? "main";
  const contentRef = useRef<HTMLDivElement>(null);
  const pendingFocus = useRef<ProfileTab | "main" | null>(null);

  useEffect(() => {
    if (pendingFocus.current !== tab || !contentRef.current) return;

    pendingFocus.current = null;
    contentRef.current.focus({ preventScroll: true });
    contentRef.current.scrollIntoView?.({ block: "start" });
  }, [tab]);
  const { data: profile } = useUserProfile(userId);
  const { isHidden, isOwner } = useIsLibraryHidden(userId, profile);
  const visibleLibraryUserId = profile && !isHidden ? userId : undefined;

  const library = useUserLibrary(visibleLibraryUserId);
  const games = useCollectionEntriesForUserId({
    userId: visibleLibraryUserId,
    limit: 1,
  });
  const achievements = useObtainedGameAchievements({
    userId,
    limit: 1,
  });
  const reviews = useReviewsForUserId(userId, 0, REVIEW_PREVIEW_LIMIT);
  const posts = useInfinitePosts({ profileUserId: userId });
  const postsPage = posts.data?.pages[0];
  const count = (value?: number) => value?.toLocaleString(language);
  const collections = library.data
    ? filterVisibleCollections(library.data.collections, isOwner)
    : undefined;

  const navigate = (next: ProfileTab | "main") => {
    if (tab === next) {
      contentRef.current?.focus({ preventScroll: true });
      contentRef.current?.scrollIntoView?.({ block: "start" });
      return;
    }

    pendingFocus.current = next;
    const query = new URLSearchParams(router.query);
    if (next === "main") query.delete("tab");
    else query.set("tab", next);
    const search = query.toString();
    void router.push(
      search ? `${router.pathname}?${search}` : router.pathname,
      {
        shallow: true,
        scroll: false,
        replace: true,
      },
    );
  };

  const navigation = [
    {
      tab: "games",
      label: t("profile.tabs.games"),
      count: count(games.data?.pagination.totalItems),
    },
    {
      tab: "reviews",
      label: t("profile.tabs.reviews"),
      count: count(reviews.data?.pagination.totalItems),
    },
    {
      tab: "posts",
      label: t("profile.tabs.posts"),
      count:
        postsPage &&
        `${count(postsPage.data.length)}${postsPage.pagination.hasNextPage ? "+" : ""}`,
    },
    {
      tab: "collections",
      label: t("profile.tabs.collections"),
      count: count(collections?.length),
    },
    {
      tab: "achievements",
      label: t("profile.tabs.achievements"),
      count: count(achievements.data?.pagination.totalItems),
    },
  ] satisfies { tab: ProfileTab; label: string; count?: string }[];

  const panels = {
    games: <ProfileGamesListView userId={userId} />,
    reviews: <ProfileReviewListView userId={userId} />,
    posts: <PostsListView profileUserId={userId} withUserProfile={false} />,
    collections: <ProfileCollectionsPage userId={userId} />,
    achievements: <JournalObtainedAchievementsView userId={userId} />,
    feats: <AchievementsScreen targetUserId={userId} withUserLevel={false} />,
    journal: <JournalOverviewView userId={userId} />,
    stats: <ProfileStatsPresenter userId={userId} withUserLevel={false} />,
  };

  const isLibraryPanel = ["games", "collections", "journal", "stats"].includes(
    tab,
  );

  return (
    <ProfileUserInfoPresenter
      userId={userId}
      navigation={
        <>
          <Divider />
          <Box
            component="nav"
            aria-label={t("profile.overview.sections")}
            className="flex justify-between gap-0.5 sm:flex-wrap sm:justify-start sm:gap-2"
          >
            {navigation.map(({ tab: value, label, count }) => (
              <ProfileNavbarItemPresenter
                key={value}
                label={label}
                count={count}
                active={tab === value}
                onClick={() => navigate(value)}
              />
            ))}
          </Box>
        </>
      }
    >
      <Box
        ref={contentRef}
        tabIndex={-1}
        className="min-w-0 scroll-mt-4 focus:outline-none"
      >
        {tab === "main" ? (
          <ProfileViewMainPage
            userId={userId}
            reviews={reviews}
            onNavigate={navigate}
          />
        ) : (
          <Stack key={tab} className="min-w-0">
            <Button
              variant="subtle"
              className="self-start"
              onClick={() => navigate("main")}
              leftSection={<IconArrowLeft size={16} aria-hidden />}
            >
              {t("profile.overview.back")}
            </Button>
            {isLibraryPanel && isHidden ? (
              <LibraryHiddenState profile={profile} />
            ) : (
              panels[tab]
            )}
          </Stack>
        )}
      </Box>
    </ProfileUserInfoPresenter>
  );
};

export { ProfileViewContent };
