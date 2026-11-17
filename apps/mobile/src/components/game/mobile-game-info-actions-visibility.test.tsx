// @vitest-environment jsdom
import React from "react";
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
  ApiError,
  CollectionEntry,
  CollectionsEntriesService,
  Game,
  GameCoverService,
  ProfileResponseDto,
  ProfileService,
  ReviewsService,
} from "@repo/wrapper/server";
import { setProjectContext } from "../../../../../packages/ui/src/util/projectContext";
import { MobileGameInfoActions } from "@/components/game/info/MobileGameInfoActions";

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@mantine/notifications", () => ({
  notifications: { show: vi.fn() },
}));

const mocks = vi.hoisted(() => ({
  session: {
    data: { user: { id: "viewer" } } as { user: { id: string } } | null,
    isPending: false,
  },
}));

vi.mock("../../../../../packages/ui/src/components/auth/authClient", () => ({
  authClient: {
    useSession: () => mocks.session,
    getSession: vi.fn(),
  },
}));

const game = { id: 1, name: "Visibility game" } as unknown as Game;

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

function notFound() {
  return new ApiError(
    {} as never,
    {
      url: "/v1/collections-entries/game/1/own",
      ok: false,
      status: 404,
      statusText: "Not Found",
      body: {},
    } as never,
    "Not found",
  );
}

function mockServices(ownEntryResult: "found" | "missing" = "found") {
  const ownEntrySpy = vi.spyOn(
    CollectionsEntriesService,
    "collectionsEntriesControllerFindOwnEntryByGameIdV1",
  );

  if (ownEntryResult === "missing") {
    ownEntrySpy.mockRejectedValue(notFound());
  } else {
    ownEntrySpy.mockResolvedValue(ownEntry);
  }

  vi.spyOn(
    CollectionsEntriesService,
    "collectionsEntriesControllerFindFavoritesByLibraryIdV1",
  ).mockResolvedValue({ data: [], pagination: {} } as never);
  vi.spyOn(
    ReviewsService,
    "reviewsControllerFindOneByUserIdAndGameIdV1",
  ).mockResolvedValue(null as never);
  vi.spyOn(
    GameCoverService,
    "gameCoverControllerFindOptionsV1",
  ).mockResolvedValue([]);
  vi.spyOn(GameCoverService, "gameCoverControllerFindMineV1").mockResolvedValue(
    { coverOptionId: null },
  );
  vi.spyOn(ProfileService, "profileControllerFindOneByIdV1").mockResolvedValue({
    customCoverMode: "any",
  } as ProfileResponseDto);
}

function renderWithProviders(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, retryDelay: 0 } },
  });

  return render(
    <MantineProvider>
      <QueryClientProvider client={client}>{ui}</QueryClientProvider>
    </MantineProvider>,
  );
}

beforeEach(() => {
  setProjectContext({
    client: "mobile",
    s3BucketUrl: "https://cdn.example.com",
    serverUrl: "https://api.example.com",
    searchUrl: "https://search.example.com",
  });
  mocks.session = { data: { user: { id: "viewer" } }, isPending: false };
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  });
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

it("changes the visibility of the owner's entry through the dedicated route", async () => {
  mockServices("found");
  const changeVisibility = vi
    .spyOn(
      CollectionsEntriesService,
      "collectionsEntriesControllerChangeVisibilityV1",
    )
    .mockResolvedValue(undefined);

  renderWithProviders(<MobileGameInfoActions game={game} />);

  const trigger = await screen.findByRole("button", {
    name: "libraryVisibility.actions.changeVisibility",
  });

  fireEvent.click(trigger);

  const privateOption = await screen.findByText(
    "libraryVisibility.levels.private.label",
  );

  expect(
    screen.getByText("libraryVisibility.notes.reviewsAlwaysPublic"),
  ).toBeTruthy();

  fireEvent.click(privateOption);

  await waitFor(() =>
    expect(changeVisibility).toHaveBeenCalledWith(game.id, {
      visibility: CollectionEntry.visibility.PRIVATE,
    }),
  );
});

it("does not offer the visibility action for a game outside the library", async () => {
  mockServices("missing");

  renderWithProviders(<MobileGameInfoActions game={game} />);

  expect(
    await screen.findByRole("button", { name: "game.buttons.addLibrary" }),
  ).toBeTruthy();
  expect(
    screen.queryByRole("button", {
      name: "libraryVisibility.actions.changeVisibility",
    }),
  ).toBeNull();
});
