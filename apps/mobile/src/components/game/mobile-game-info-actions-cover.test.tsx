// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  ApiError,
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

const game = { id: 1, name: "Cover game" } as unknown as Game;

function notFound() {
  return new ApiError(
    {} as never,
    {
      url: "/v1/collection-entry/own/1",
      ok: false,
      status: 404,
      statusText: "Not Found",
      body: {},
    } as never,
    "Not found",
  );
}

function mockServices() {
  vi.spyOn(
    CollectionsEntriesService,
    "collectionsEntriesControllerFindOwnEntryByGameIdV1",
  ).mockRejectedValue(notFound());
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
  mockServices();
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

it("offers the cover picker from the mobile game info actions without a library entry", async () => {
  renderWithProviders(<MobileGameInfoActions game={game} />);

  const addToLibrary = await screen.findByRole("button", {
    name: "game.buttons.addLibrary",
  });
  expect(addToLibrary).toBeTruthy();

  fireEvent.click(
    screen.getByRole("button", { name: "game.coverPicker.open" }),
  );

  expect(await screen.findByText("game.coverPicker.empty")).toBeTruthy();
});
