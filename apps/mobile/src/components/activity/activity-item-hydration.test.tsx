// @vitest-environment jsdom
import React from "react";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UIProvider } from "@repo/ui";
import {
  AchievementsService,
  Activity,
  ActivityResponseDto,
  Collection,
  CollectionEntry,
  CollectionsEntriesService,
  CollectionsService,
  Game,
  GameAchievementService,
  GameObtainedAchievementActivityDto,
  GameRepositoryService,
  Post,
  PostsService,
  ProfileResponseDto,
  ProfileService,
  Review,
  ReviewsService,
} from "@repo/wrapper/server";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import enTranslations from "../../../../../packages/locales/src/translations/json/en.json";
import { ActivityItem } from "../../../../../packages/ui/src/components/activity/item/ActivityItem";

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      let val: unknown = enTranslations;
      // Minimal i18next plural resolution: `key_one` / `key_other` when a count is given.
      const parts = key.split(".");
      if (typeof options?.count === "number") {
        parts[parts.length - 1] += options.count === 1 ? "_one" : "_other";
      }
      for (const p of parts) {
        val =
          typeof val === "object" && val !== null
            ? (val as Record<string, unknown>)[p]
            : undefined;
      }
      return typeof val === "string"
        ? val.replace(/\{\{(\w+)\}\}/g, (_, k) => String(options?.[k] ?? ""))
        : key;
    },
  }),
}));

vi.mock(
  "../../../../../packages/ui/src/components/activity/input/ActivityItemLikes",
  () => ({
    ActivityItemLikes: () => <div data-testid="activity-likes">likes</div>,
  }),
);

vi.mock("../../../../../packages/ui/src/components/auth/authClient", () => ({
  authClient: { useSession: () => ({ data: null, isPending: false }) },
}));

vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({
    useUserId: () => undefined,
  }),
);

vi.mock(
  "../../../../../packages/ui/src/components/general/hooks/useOnMobile",
  () => ({
    useOnMobile: () => true,
  }),
);

let queryClient: QueryClient;

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <UIProvider
          presenters={{
            Link: ({ href, children, ...others }) => (
              <a href={href} {...others}>
                {children}
              </a>
            ),
          }}
          hooks={{
            useRouter: () => ({
              pathname: "/",
              query: new URLSearchParams(),
              back: vi.fn(),
              push: vi.fn(async () => {}),
            }),
          }}
        >
          {children}
        </UIProvider>
      </MantineProvider>
    </QueryClientProvider>
  );
}

function spyAllServices() {
  return {
    profile: vi.spyOn(ProfileService, "profileControllerFindOneByIdV1"),
    collectionEntry: vi.spyOn(
      CollectionsEntriesService,
      "collectionsEntriesControllerFindEntryByIdV1",
    ),
    collection: vi.spyOn(
      CollectionsService,
      "collectionsControllerFindOneByIdWithPermissionsV1",
    ),
    review: vi.spyOn(ReviewsService, "reviewsControllerFindOneByIdV1"),
    post: vi.spyOn(PostsService, "postsControllerFindOneV1"),
    game: vi.spyOn(
      GameRepositoryService,
      "gameRepositoryControllerFindOneByIdV1",
    ),
    gameAchievementActivity: vi.spyOn(
      GameAchievementService,
      "gameAchievementV2ControllerFindActivityByIdV2",
    ),
    achievementsV2: vi.spyOn(
      AchievementsService,
      "achievementsV2ControllerGetAchievementsV2",
    ),
  };
}

function expectNoActivityRequests(spies: ReturnType<typeof spyAllServices>) {
  expect(spies.profile).not.toHaveBeenCalled();
  expect(spies.collectionEntry).not.toHaveBeenCalled();
  expect(spies.collection).not.toHaveBeenCalled();
  expect(spies.review).not.toHaveBeenCalled();
  expect(spies.post).not.toHaveBeenCalled();
  expect(spies.game).not.toHaveBeenCalled();
  expect(spies.gameAchievementActivity).not.toHaveBeenCalled();
  expect(spies.achievementsV2).not.toHaveBeenCalled();
}

beforeEach(() => {
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, retryDelay: 0 } },
  });
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const baseProfile = {
  userId: "user-1",
  username: "alice",
  avatar: { filename: "alice-avatar", extension: "png" },
};

describe("ActivityItem hydration", () => {
  it("renders a hydrated COLLECTION_ENTRY without follow-up requests", () => {
    const spies = spyAllServices();
    const activity = {
      id: "act-col",
      type: ActivityResponseDto.type.COLLECTION_ENTRY,
      profileUserId: "user-1",
      profile: baseProfile,
      collectionEntryId: "ce-1",
      collectionEntry: { id: "ce-1", gameId: 42 },
      collectionId: "col-1",
      collection: { id: "col-1", name: "Backlog" },
      review: null,
      reviewId: null,
      userFollow: null,
      userFollowId: null,
      post: null,
      postId: null,
      obtainedGameAchievementActivity: null,
      obtainedGameAchievementActivityId: null,
      obtainedAchievement: null,
      obtainedAchievementId: null,
      game: { id: 42, name: "Elden Ring", cover: null },
      statistics: { likesCount: 3, isLiked: false },
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      statisticsTarget: null,
      statisticsTargetId: null,
    } as unknown as ActivityResponseDto;

    render(<ActivityItem activity={activity} />, { wrapper: Providers });

    expect(screen.getByText("alice")).toBeTruthy();
    expect(screen.getByText("Added to Backlog")).toBeTruthy();
    expect(screen.getByText("Elden Ring")).toBeTruthy();
    expectNoActivityRequests(spies);
  });

  it("never fetches a private collection when server embeds collection=null", () => {
    const spies = spyAllServices();
    const activity = {
      id: "act-private-col",
      type: ActivityResponseDto.type.COLLECTION_ENTRY,
      profileUserId: "user-1",
      profile: baseProfile,
      collectionEntryId: "ce-1",
      collectionEntry: { id: "ce-1", gameId: 42 },
      collectionId: "private-col-1",
      collection: null,
      review: null,
      reviewId: null,
      userFollow: null,
      userFollowId: null,
      post: null,
      postId: null,
      obtainedGameAchievementActivity: null,
      obtainedGameAchievementActivityId: null,
      obtainedAchievement: null,
      obtainedAchievementId: null,
      game: { id: 42, name: "Elden Ring", cover: null },
      statistics: { likesCount: 0, isLiked: false },
    } as unknown as ActivityResponseDto;

    render(<ActivityItem activity={activity} />, { wrapper: Providers });

    expect(screen.getByText("Added to")).toBeTruthy();
    expect(screen.getByText("Elden Ring")).toBeTruthy();
    expectNoActivityRequests(spies);
  });

  it("renders hydrated REVIEW, POST, and FOLLOW without follow-up requests", () => {
    const spies = spyAllServices();
    const reviewActivity = {
      id: "act-rev",
      type: ActivityResponseDto.type.REVIEW,
      profileUserId: "user-1",
      profile: baseProfile,
      collectionEntry: null,
      collectionEntryId: null,
      collection: null,
      collectionId: null,
      reviewId: "rev-1",
      review: { id: "rev-1", gameId: 7, rating: 4 },
      post: null,
      postId: null,
      obtainedGameAchievementActivity: null,
      obtainedGameAchievementActivityId: null,
      obtainedAchievement: null,
      obtainedAchievementId: null,
      game: { id: 7, name: "Portal 2", cover: null },
      statistics: { likesCount: 1, isLiked: true },
    } as unknown as ActivityResponseDto;

    const postActivity = {
      id: "act-post",
      type: ActivityResponseDto.type.POST,
      profileUserId: "user-1",
      profile: baseProfile,
      collectionEntry: null,
      collectionEntryId: null,
      collection: null,
      collectionId: null,
      review: null,
      reviewId: null,
      postId: "post-1",
      post: { id: "post-1", gameId: 8 },
      obtainedGameAchievementActivity: null,
      obtainedGameAchievementActivityId: null,
      obtainedAchievement: null,
      obtainedAchievementId: null,
      game: { id: 8, name: "Hades", cover: null },
      statistics: { likesCount: 0, isLiked: false },
    } as unknown as ActivityResponseDto;

    const followActivity = {
      id: "act-follow",
      type: ActivityResponseDto.type.FOLLOW,
      profileUserId: "user-1",
      profile: baseProfile,
      collectionEntry: null,
      collectionEntryId: null,
      collection: null,
      collectionId: null,
      review: null,
      reviewId: null,
      post: null,
      postId: null,
      obtainedGameAchievementActivity: null,
      obtainedGameAchievementActivityId: null,
      obtainedAchievement: null,
      obtainedAchievementId: null,
      game: null,
      statistics: { likesCount: 0, isLiked: false },
    } as unknown as ActivityResponseDto;

    const { container, rerender } = render(
      <>
        <ActivityItem activity={reviewActivity} />
        <ActivityItem activity={postActivity} />
        <ActivityItem activity={followActivity} />
      </>,
      { wrapper: Providers },
    );

    expect(screen.getByText("Reviewed")).toBeTruthy();
    expect(screen.getByText("Portal 2")).toBeTruthy();
    expect(screen.getByText("Posted about")).toBeTruthy();
    expect(screen.getByText("Hades")).toBeTruthy();
    expect(screen.getByText("Followed")).toBeTruthy();
    rerender(
      <>
        <ActivityItem activity={reviewActivity} variant={"card"} />
        <ActivityItem activity={postActivity} variant={"card"} />
        <ActivityItem activity={followActivity} variant={"card"} />
      </>,
    );

    expect(screen.getByText("Followed")).toBeTruthy();
    expect(
      screen.getByText("Portal 2").closest("a")?.getAttribute("href"),
    ).toBe("/game/7?reviewId=rev-1");
    expect(container.querySelector('a[href="/game/undefined"]')).toBeNull();
    expectNoActivityRequests(spies);
  });

  it("falls back to hooks only when embedded fields are undefined", async () => {
    const spies = spyAllServices();
    spies.profile.mockResolvedValue({
      userId: "user-1",
      username: "legacy-alice",
      avatar: null,
      avatarVideo: null,
    } as unknown as ProfileResponseDto);
    spies.collectionEntry.mockResolvedValue({
      id: "ce-legacy",
      gameId: 55,
    } as unknown as CollectionEntry);
    spies.collection.mockResolvedValue({
      id: "col-legacy",
      name: "Wishlist",
    } as unknown as Collection);
    spies.game.mockResolvedValue({
      id: 55,
      name: "Hollow Knight",
    } as unknown as Game);

    const legacyActivity = {
      id: "act-legacy",
      type: Activity.type.COLLECTION_ENTRY,
      profileUserId: "user-1",
      collectionEntryId: "ce-legacy",
      collectionId: "col-legacy",
    } as unknown as Activity;

    render(<ActivityItem activity={legacyActivity} />, { wrapper: Providers });

    await waitFor(() => {
      expect(screen.getByText("legacy-alice")).toBeTruthy();
      expect(screen.getByText("Added to Wishlist")).toBeTruthy();
      expect(screen.getByText("Hollow Knight")).toBeTruthy();
    });

    expect(spies.profile).toHaveBeenCalledWith("user-1");
    expect(spies.collectionEntry).toHaveBeenCalledWith("ce-legacy");
    expect(spies.collection).toHaveBeenCalledWith("col-legacy");
    expect(spies.game).toHaveBeenCalledWith(55, { relations: { cover: true } });
    expect(spies.achievementsV2).not.toHaveBeenCalled();
  });

  it("falls back to review and post hooks when undefined", async () => {
    const spies = spyAllServices();
    spies.profile.mockResolvedValue({
      userId: "user-1",
      username: "legacy-alice",
      avatar: null,
      avatarVideo: null,
    } as unknown as ProfileResponseDto);
    spies.review.mockResolvedValue({
      id: "rev-legacy",
      gameId: 101,
      rating: 5,
    } as unknown as Review);
    spies.post.mockResolvedValue({
      id: "post-legacy",
      gameId: 102,
    } as unknown as Post);
    // Both cards mount together, so their games come from one batch read.
    const games = vi
      .spyOn(GameRepositoryService, "gameRepositoryControllerFindAllByIdsV1")
      .mockResolvedValue([
        { id: 102, name: "Balatro" },
        { id: 101, name: "Celeste" },
      ] as unknown as Game[]);

    render(
      <>
        <ActivityItem
          activity={
            {
              id: "act-rev-legacy",
              type: Activity.type.REVIEW,
              profileUserId: "user-1",
              profile: baseProfile,
              reviewId: "rev-legacy",
            } as unknown as Activity
          }
        />
        <ActivityItem
          activity={
            {
              id: "act-post-legacy",
              type: Activity.type.POST,
              profileUserId: "user-1",
              profile: baseProfile,
              postId: "post-legacy",
            } as unknown as Activity
          }
        />
      </>,
      { wrapper: Providers },
    );

    await waitFor(() => {
      expect(screen.getByText("Celeste")).toBeTruthy();
      expect(screen.getByText("Balatro")).toBeTruthy();
    });
    expect(spies.review).toHaveBeenCalledWith("rev-legacy");
    expect(spies.post).toHaveBeenCalledWith("post-legacy");
    expect(spies.profile).not.toHaveBeenCalled();
    expect(games).toHaveBeenCalledTimes(1);
    expect(spies.game).not.toHaveBeenCalled();
  });

  it.each([undefined, []])(
    "lazily fetches detailed game achievements only when the popover opens (summary relation %j)",
    async (summaryRelation) => {
      const spies = spyAllServices();
      spies.gameAchievementActivity.mockResolvedValue({
        id: 77,
        profileUserId: "user-1",
        totalObtained: 2,
        hasCompletedAllAchievements: false,
        hasObtainedPlatinumTrophy: false,
        externalGameId: 9,
        externalGame: { id: 9, gameId: 33 },
        obtainedGameAchievements: [
          {
            externalId: "ach-1",
            name: "First Steps",
            description: "Start the journey",
            iconUrl: "https://example.com/ach-1.png",
            isObtained: true,
            obtainedAt: "2026-01-01T00:00:00.000Z",
          },
        ],
      } as unknown as GameObtainedAchievementActivityDto);

      const activity = {
        id: "act-ga",
        type: ActivityResponseDto.type.OBTAINED_GAME_ACHIEVEMENT,
        profileUserId: "user-1",
        profile: baseProfile,
        collectionEntry: null,
        collectionEntryId: null,
        collection: null,
        collectionId: null,
        review: null,
        reviewId: null,
        post: null,
        postId: null,
        obtainedGameAchievementActivityId: 77,
        obtainedGameAchievementActivity: {
          id: 77,
          obtainedGameAchievements: summaryRelation,
          profileUserId: "user-1",
          totalObtained: 2,
          hasCompletedAllAchievements: false,
          hasObtainedPlatinumTrophy: false,
          externalGameId: 9,
          externalGame: { id: 9, gameId: 33 },
        },
        obtainedAchievement: null,
        obtainedAchievementId: null,
        game: { id: 33, name: "Sekiro", cover: null },
        statistics: { likesCount: 0, isLiked: false },
      } as unknown as ActivityResponseDto;

      render(<ActivityItem activity={activity} />, { wrapper: Providers });

      const trigger = screen.getByText("Obtained 2 achievements");
      expect(screen.getByText("Sekiro")).toBeTruthy();
      expect(spies.gameAchievementActivity).not.toHaveBeenCalled();
      expect(spies.game).not.toHaveBeenCalled();
      expect(spies.profile).not.toHaveBeenCalled();

      fireEvent.click(trigger);

      await waitFor(() => {
        expect(spies.gameAchievementActivity).toHaveBeenCalledTimes(1);
        expect(spies.gameAchievementActivity).toHaveBeenCalledWith(77);
        expect(screen.getByAltText("First Steps")).toBeTruthy();
      });
      expect(spies.game).not.toHaveBeenCalled();
      expect(spies.profile).not.toHaveBeenCalled();
    },
  );

  it("does not refetch detailed achievements on open when already detailed", async () => {
    const spies = spyAllServices();
    const activity = {
      id: "act-ga-detailed",
      type: ActivityResponseDto.type.OBTAINED_GAME_ACHIEVEMENT,
      profileUserId: "user-1",
      profile: baseProfile,
      collectionEntry: null,
      collectionEntryId: null,
      collection: null,
      collectionId: null,
      review: null,
      reviewId: null,
      post: null,
      postId: null,
      obtainedGameAchievementActivityId: 88,
      obtainedGameAchievementActivity: {
        id: 88,
        profileUserId: "user-1",
        totalObtained: 1,
        hasCompletedAllAchievements: false,
        hasObtainedPlatinumTrophy: false,
        externalGameId: 9,
        externalGame: { id: 9, gameId: 33 },
        obtainedGameAchievements: [
          {
            externalId: "ach-already",
            name: "Already Loaded",
            description: "Loaded via fallback DTO",
            iconUrl: "https://example.com/ach-already.png",
            isObtained: true,
            obtainedAt: "2026-01-01T00:00:00.000Z",
          },
        ],
      },
      obtainedAchievement: null,
      obtainedAchievementId: null,
      game: { id: 33, name: "Sekiro", cover: null },
      statistics: { likesCount: 0, isLiked: false },
    } as unknown as ActivityResponseDto;

    render(<ActivityItem activity={activity} />, { wrapper: Providers });

    const trigger = screen.getByText("Obtained 1 achievement");
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByAltText("Already Loaded")).toBeTruthy();
    });
    expectNoActivityRequests(spies);
  });
});
