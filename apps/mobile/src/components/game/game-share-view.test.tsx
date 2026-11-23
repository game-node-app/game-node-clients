// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  CollectionEntry,
  CollectionsEntriesService,
  Game,
  GameAchievementService,
  GameCoverService,
  GameRepositoryService,
  PlaytimeService,
  ProfileResponseDto,
  ProfileService,
  ReviewsService,
} from "@repo/wrapper/server";
import { setProjectContext } from "../../../../../packages/ui/src/util/projectContext";
import { GameShareView } from "../../../../../packages/ui/src/components/game/share/GameShareView";

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options?.name ? `${key}:${options.name}` : key,
    i18n: { language: "en" },
  }),
}));

vi.mock("@mantine/notifications", () => ({
  notifications: { show: vi.fn() },
}));

const mocks = vi.hoisted(() => ({
  session: {
    data: null as { user: { id: string } } | null,
    isPending: false,
  },
}));

vi.mock("../../../../../packages/ui/src/components/auth/authClient", () => ({
  authClient: {
    useSession: () => mocks.session,
    getSession: vi.fn(),
  },
}));

const game = {
  id: 1,
  name: "Dishonored 2",
  cover: null,
  artworks: [],
  screenshots: [],
  platforms: [],
  firstReleaseDate: "2016-11-11T00:00:00.000Z",
  involvedCompanies: [{ developer: true, company: { name: "Arkane Studios" } }],
} as unknown as Game;

const ownEntry = {
  id: "entry-1",
  gameId: game.id,
  libraryUserId: "viewer",
  isFavorite: false,
  status: CollectionEntry.status.PLAYING,
  visibility: CollectionEntry.visibility.PUBLIC,
  collections: [],
  ownedPlatforms: [],
} as unknown as CollectionEntry;

function mockServices() {
  vi.spyOn(
    GameRepositoryService,
    "gameRepositoryControllerFindOneByIdV1",
  ).mockResolvedValue(game);
  vi.spyOn(
    GameCoverService,
    "gameCoverControllerFindOptionsV1",
  ).mockResolvedValue([]);
  vi.spyOn(GameCoverService, "gameCoverControllerFindMineV1").mockResolvedValue(
    { coverOptionId: null },
  );

  return {
    review: vi.spyOn(
      ReviewsService,
      "reviewsControllerFindOneByUserIdAndGameIdV1",
    ),
    ownEntry: vi.spyOn(
      CollectionsEntriesService,
      "collectionsEntriesControllerFindOwnEntryByGameIdV1",
    ),
    icons: vi.spyOn(
      CollectionsEntriesService,
      "collectionsEntriesControllerGetIconsForOwnedPlatformsV1",
    ),
    playtime: vi.spyOn(
      PlaytimeService,
      "playtimeControllerFindAllByUserIdAndGameIdV1",
    ),
    available: vi.spyOn(
      GameAchievementService,
      "gameAchievementV2ControllerFindAllByGameIdV2",
    ),
    obtained: vi.spyOn(
      GameAchievementService,
      "gameAchievementV2ControllerFindAllObtainedByUserIdAndGameIdV2",
    ),
    profile: vi.spyOn(ProfileService, "profileControllerFindOneByIdV1"),
  };
}

function renderView() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, retryDelay: 0 } },
  });

  return render(
    <MantineProvider>
      <QueryClientProvider client={client}>
        <GameShareView gameId={game.id} compact={false} onClose={vi.fn()} />
      </QueryClientProvider>
    </MantineProvider>,
  );
}

beforeEach(() => {
  setProjectContext({
    client: "web",
    s3BucketUrl: "https://cdn.example.com",
    serverUrl: "https://api.example.com",
    searchUrl: "https://search.example.com",
  });
  mocks.session = { data: null, isPending: false };
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  })) as never;
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it("is fully usable signed out, without the game in a library or a review", async () => {
  const services = mockServices();

  renderView();

  const card = await screen.findByTestId("game-share-card");
  expect(card.textContent).toContain("Dishonored 2");
  expect(card.textContent).toContain("Arkane Studios, 2016");

  // Nothing personal is on the card, so there is nothing to switch either.
  expect(card.textContent).not.toContain("game.share.card.");
  expect(card.textContent).not.toMatch(/@(?!font-face)/);
  expect(screen.queryByText("game.share.sections.onCard")).toBeNull();

  // The shared controls and every action still work.
  expect(
    screen.getByRole("radio", { name: "game.share.backgrounds.art" }),
  ).toBeTruthy();
  expect(
    screen
      .getByRole("button", { name: "actions.share" })
      .hasAttribute("disabled"),
  ).toBe(false);
  expect(
    screen
      .getByRole("button", { name: "game.share.actions.downloadImage" })
      .hasAttribute("disabled"),
  ).toBe(false);
  expect(
    screen.getByRole("button", { name: "game.share.actions.copyLink" }),
  ).toBeTruthy();

  // No request that needs a signed-in user is made.
  await waitFor(() => expect(card).toBeTruthy());
  for (const key of [
    "review",
    "ownEntry",
    "icons",
    "playtime",
    "obtained",
    "profile",
  ] as const) {
    expect(services[key]).not.toHaveBeenCalled();
  }
});

it("shows the personal blocks a signed-in viewer has, and lets them be removed", async () => {
  mocks.session = { data: { user: { id: "viewer" } }, isPending: false };
  const services = mockServices();
  services.review.mockResolvedValue({ rating: 4.5 } as never);
  services.ownEntry.mockResolvedValue(ownEntry);
  services.icons.mockResolvedValue([]);
  services.playtime.mockResolvedValue([
    { totalPlaytimeSeconds: 3600 * 20 },
  ] as never);
  services.available.mockResolvedValue([]);
  services.obtained.mockResolvedValue([]);
  services.profile.mockResolvedValue({
    username: "marina",
    customCoverMode: "any",
  } as ProfileResponseDto);

  renderView();

  const card = await screen.findByTestId("game-share-card");
  await waitFor(() => expect(card.textContent).toContain("4.5"));
  expect(card.textContent).toContain("20 h");
  expect(card.textContent).toContain("@marina");
  expect(card.textContent).toContain("collectionEntry.statuses.playing");

  // Only blocks with data get a chip: there are no achievements or platforms.
  expect(
    screen.queryByRole("button", { name: "game.share.options.achievements" }),
  ).toBeNull();
  const ratingChip = screen.getByRole("button", {
    name: "game.share.options.rating",
  });
  expect(ratingChip.getAttribute("aria-pressed")).toBe("true");

  fireEvent.click(ratingChip);

  await waitFor(() => expect(card.textContent).not.toContain("4.5"));
  expect(card.textContent).toContain("20 h");
});
