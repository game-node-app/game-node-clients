// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MantineProvider } from "@mantine/core";
import { UIProvider } from "@repo/ui";
import {
  AchievementsService,
  Activity,
  BlogArticleDto,
  BlogReviewDto,
  CollectionEntriesPaginatedResponseDto,
  CollectionEntry,
  CollectionsEntriesService,
  DailyGuessFeedbackDto,
  Game,
  GameRepositoryService,
  LibrariesService,
  Library,
  ProfileResponseDto,
  ProfileService,
} from "@repo/wrapper/server";
import { DailyGuessList } from "../../../../../packages/ui/src/components/daily/guess/DailyGuessList";
import { ActivityItem } from "../../../../../packages/ui/src/components/activity/item/ActivityItem";
import { BlogPostReviewInfo } from "../../../../../packages/ui/src/components/blog/view/BlogPostReviewInfo";
import { BlogPostsFeaturedReviewCard } from "../../../../../packages/ui/src/components/blog/card/BlogPostsFeaturedReviewCard";
import { CollectionEntriesMoveForm } from "../../../../../packages/ui/src/components/collection/collection-entry/form/CollectionEntriesMoveForm";

const mocks = vi.hoisted(() => ({
  session: {
    data: null as { user: { id: string } } | null,
    isPending: false,
  },
}));

vi.mock("../../../../../packages/ui/src/components/auth/authClient", () => ({
  authClient: { useSession: () => mocks.session },
}));

vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => "viewer-1" }),
);

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

function signIn(userId: string) {
  mocks.session = { data: { user: { id: userId } }, isPending: false };
}

function signOut() {
  mocks.session = { data: null, isPending: false };
}

function createClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, retryDelay: 0 } },
  });
}

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
          hooks={{ useRouter: () => testRouter }}
        >
          {children}
        </UIProvider>
      </MantineProvider>
    </QueryClientProvider>
  );
}

let testRouter: {
  pathname: string;
  query: URLSearchParams;
  back: () => void;
  push: (route: string) => Promise<void>;
};

let queryClient: QueryClient;

const profile = (customCoverMode?: string) =>
  ({ customCoverMode }) as unknown as ProfileResponseDto;

const game = (id: number) => ({ id, name: `Game ${id}` }) as Game;

const entry = (gameId: number): CollectionEntry =>
  ({
    id: `entry-${gameId}`,
    gameId,
    collections: [],
    ownedPlatforms: [],
    isFavorite: false,
    status: CollectionEntry.status.PLAYING,
  }) as unknown as CollectionEntry;

beforeEach(() => {
  queryClient = createClient();
  testRouter = {
    pathname: "/",
    query: new URLSearchParams(),
    back: vi.fn(),
    push: vi.fn(async () => {}),
  };
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
  signOut();
});

function expectNoOptIn(dto: Record<string, unknown> | undefined) {
  expect(dto?.personalizeCovers).toBeUndefined();
  expect(dto?.coverOwnerUserId).toBeUndefined();
}

describe("surfaces that always show the default cover", () => {
  it("DailyGuessList sends no opt-in fields", async () => {
    signIn("viewer-1");
    const profileSpy = vi.spyOn(
      ProfileService,
      "profileControllerFindOneByIdV1",
    );
    const findAll = vi
      .spyOn(GameRepositoryService, "gameRepositoryControllerFindAllByIdsV1")
      .mockResolvedValue([game(1)]);

    const feedback = [
      {
        gameId: 1,
        name: "Game 1",
        result: "correct",
        commonGenres: [],
        commonPlatforms: [],
      },
    ] as unknown as DailyGuessFeedbackDto[];

    render(<DailyGuessList feedback={feedback} />, { wrapper: Providers });

    await waitFor(() => expect(findAll).toHaveBeenCalled());
    expect(findAll).toHaveBeenLastCalledWith({
      gameIds: [1],
      relations: { cover: true },
    });
    expectNoOptIn(findAll.mock.lastCall?.[0] as Record<string, unknown>);
    expect(profileSpy).not.toHaveBeenCalled();
  });

  it("ActivityItem sends no opt-in fields", async () => {
    signIn("viewer-1");
    vi.spyOn(
      ProfileService,
      "profileControllerFindOneByIdV1",
    ).mockResolvedValue(profile("any"));
    vi.spyOn(
      AchievementsService,
      "achievementsV2ControllerGetAchievementsV2",
    ).mockResolvedValue({ data: [] } as never);
    vi.spyOn(
      CollectionsEntriesService,
      "collectionsEntriesControllerFindEntryByIdV1",
    ).mockResolvedValue(entry(1));
    const findOne = vi
      .spyOn(GameRepositoryService, "gameRepositoryControllerFindOneByIdV1")
      .mockResolvedValue(game(1));

    const activity = {
      id: "activity-1",
      type: Activity.type.COLLECTION_ENTRY,
      profileUserId: "owner-1",
      collectionEntryId: "entry-1",
    } as unknown as Activity;

    render(<ActivityItem activity={activity} />, { wrapper: Providers });

    await waitFor(() =>
      expect(findOne).toHaveBeenCalledWith(1, { relations: { cover: true } }),
    );
    expect(
      findOne.mock.calls.some(
        ([, dto]) =>
          dto.personalizeCovers != undefined ||
          dto.coverOwnerUserId != undefined,
      ),
    ).toBe(false);
  });
});

describe("surfaces that do not display a cover", () => {
  it("BlogPostReviewInfo sends no opt-in fields", async () => {
    signIn("viewer-1");
    const profileSpy = vi
      .spyOn(ProfileService, "profileControllerFindOneByIdV1")
      .mockResolvedValue(profile("any"));
    const findOne = vi
      .spyOn(GameRepositoryService, "gameRepositoryControllerFindOneByIdV1")
      .mockResolvedValue(game(1));

    render(
      <BlogPostReviewInfo
        reviewInfo={{ gameId: 1, rating: 80 } as BlogReviewDto}
      />,
      { wrapper: Providers },
    );

    await waitFor(() => expect(findOne).toHaveBeenCalled());
    expect(findOne).toHaveBeenLastCalledWith(1, {
      relations: { cover: true },
    });
    expectNoOptIn(findOne.mock.lastCall?.[1] as Record<string, unknown>);
    expect(profileSpy).not.toHaveBeenCalled();
  });

  it("BlogPostsFeaturedReviewCard sends no opt-in fields", async () => {
    signIn("viewer-1");
    const profileSpy = vi
      .spyOn(ProfileService, "profileControllerFindOneByIdV1")
      .mockResolvedValue(profile("any"));
    const findOne = vi
      .spyOn(GameRepositoryService, "gameRepositoryControllerFindOneByIdV1")
      .mockResolvedValue(game(1));

    const post = {
      id: "post-1",
      title: "Review",
      excerpt: "Excerpt",
      publishedAt: "2026-01-01T00:00:00.000Z",
      review: { gameId: 1, rating: 80 },
      cover: { url: "https://example.com/post.jpg", alt: "Post cover" },
    } as unknown as BlogArticleDto;

    render(<BlogPostsFeaturedReviewCard post={post} />, {
      wrapper: Providers,
    });

    await waitFor(() => expect(findOne).toHaveBeenCalled());
    expect(findOne).toHaveBeenLastCalledWith(1, {
      relations: { cover: true },
    });
    expectNoOptIn(findOne.mock.lastCall?.[1] as Record<string, unknown>);
    expect(profileSpy).not.toHaveBeenCalled();
  });

  it("CollectionEntriesMoveForm sends no opt-in fields", async () => {
    signIn("viewer-1");
    const profileSpy = vi
      .spyOn(ProfileService, "profileControllerFindOneByIdV1")
      .mockResolvedValue(profile("any"));
    vi.spyOn(
      LibrariesService,
      "librariesControllerFindOneByIdWithPermissionsV1",
    ).mockResolvedValue({ collections: [] } as unknown as Library);
    vi.spyOn(
      CollectionsEntriesService,
      "collectionsEntriesControllerFindAllByCollectionIdV1",
    ).mockResolvedValue({
      data: [entry(1)],
      pagination: {},
    } as unknown as CollectionEntriesPaginatedResponseDto);
    const findAll = vi
      .spyOn(GameRepositoryService, "gameRepositoryControllerFindAllByIdsV1")
      .mockResolvedValue([game(1)]);

    render(<CollectionEntriesMoveForm collectionId={"collection-1"} />, {
      wrapper: Providers,
    });

    await waitFor(() => expect(findAll).toHaveBeenCalled());
    expect(findAll).toHaveBeenLastCalledWith({
      gameIds: [1],
      relations: { cover: true },
    });
    expectNoOptIn(findAll.mock.lastCall?.[0] as Record<string, unknown>);
    expect(profileSpy).not.toHaveBeenCalled();
  });
});
