// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  ApiError,
  CollectionEntry,
  CollectionsEntriesService,
  Game,
  GameCoverService,
  GameRepositoryService,
  LibrariesService,
  PreferredPlatformService,
  ProfileResponseDto,
  ProfileService,
  ReviewsService,
} from "@repo/wrapper/server";
import { useForm, FormProvider } from "react-hook-form";
import { GameInfoActions } from "../../../../../packages/ui/src/components/game/info/GameInfoActions";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";
import { LinkComponentProps } from "../../../../../packages/ui/src/util/link";
import {
  CollectionEntryFormDetailsPanel,
  TGameAddOrUpdateValues,
} from "../../../../../packages/ui/src/components/collection/collection-entry/form";
import { setProjectContext } from "../../../../../packages/ui/src/util/projectContext";

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
  vi.spyOn(
    GameRepositoryService,
    "gameRepositoryControllerFindOneByIdV1",
  ).mockResolvedValue(game);
  vi.spyOn(
    GameRepositoryService,
    "gameRepositoryControllerGetResourceV1",
  ).mockResolvedValue([] as never);
  vi.spyOn(
    LibrariesService,
    "librariesControllerFindOneByIdWithPermissionsV1",
  ).mockResolvedValue({ collections: [] } as never);
  vi.spyOn(
    PreferredPlatformService,
    "preferredPlatformControllerFindAllByUserIdV1",
  ).mockResolvedValue([]);
}

function DetailsPanelHarness({
  showGameInfo,
  onSubmit,
}: {
  showGameInfo: boolean;
  onSubmit: () => void;
}) {
  const form = useForm<TGameAddOrUpdateValues>({
    defaultValues: {
      status: CollectionEntry.status.PLANNED,
      finishedAt: null,
      relatedGamesIds: [],
      collectionIds: [],
      review: {},
    },
  });

  return (
    <FormProvider {...form}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <CollectionEntryFormDetailsPanel
          gameId={game.id}
          showGameInfo={showGameInfo}
        />
      </form>
    </FormProvider>
  );
}

function renderDetailsPanel(showGameInfo: boolean, onSubmit = vi.fn()) {
  renderWithProviders(
    <DetailsPanelHarness showGameInfo={showGameInfo} onSubmit={onSubmit} />,
  );

  return { onSubmit };
}

const PresenterLink = ({ href, children, ...rest }: LinkComponentProps) => (
  <a href={href} {...rest}>
    {children}
  </a>
);

function renderWithProviders(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, retryDelay: 0 } },
  });

  return render(
    <QueryClientProvider client={client}>
      <UIProvider
        presenters={{ Link: PresenterLink }}
        hooks={{
          useRouter: () => ({
            pathname: "",
            back: () => {},
            push: async () => {},
            query: new URLSearchParams(),
          }),
        }}
      >
        <MantineProvider>{ui}</MantineProvider>
      </UIProvider>
    </QueryClientProvider>,
  );
}

async function expectPickerOpens() {
  const openPicker = screen.getByRole("button", {
    name: "game.coverPicker.open",
  });
  fireEvent.click(openPicker);

  expect(await screen.findByText("game.coverPicker.empty")).toBeTruthy();
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

it("offers the cover picker from the web game info actions without a library entry", async () => {
  renderWithProviders(<GameInfoActions game={game} />);

  const addToLibrary = await screen.findByRole("button", {
    name: "game.buttons.addLibrary",
  });
  expect(addToLibrary).toBeTruthy();

  await expectPickerOpens();
});

it("offers the cover picker from the collection entry details panel cover column without submitting the form", async () => {
  const { onSubmit } = renderDetailsPanel(true);

  expect(await screen.findByText(game.name)).toBeTruthy();
  expect(
    screen.getAllByRole("button", { name: "game.coverPicker.open" }),
  ).toHaveLength(1);

  await expectPickerOpens();

  expect(onSubmit).not.toHaveBeenCalled();
});

it("keeps the cover picker action beside the title when the cover column is hidden", async () => {
  renderDetailsPanel(false);

  expect(await screen.findByText(game.name)).toBeTruthy();

  await expectPickerOpens();
});
