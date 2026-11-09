// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import {
  ApiError,
  Game,
  GameCoverOptionResponseDto,
  GameCoverService,
  GameRepositoryService,
  ProfileResponseDto,
  ProfileService,
} from "@repo/wrapper/server";
import { GameCoverPickerModal } from "../../../../../packages/ui/src/components/game/info/GameCoverPickerModal";
import { GAME_COVER_PLACEHOLDER } from "../../../../../packages/ui/src/components/game/hooks/useGameCoverImage";
import { handleAuthError } from "../../../../../packages/ui/src/components/auth/handleAuthError";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const notifications = vi.hoisted(() => ({ show: vi.fn() }));
vi.mock("@mantine/notifications", () => ({ notifications }));

const mocks = vi.hoisted(() => ({
  session: {
    data: null as { user: { id: string } } | null,
    isPending: false,
  },
  getSession: vi.fn(),
  push: vi.fn(),
}));

vi.mock("../../../../../packages/ui/src/components/auth/authClient", () => ({
  authClient: {
    useSession: () => mocks.session,
    getSession: mocks.getSession,
  },
}));

const IGDB_URL = "https://images.igdb.com/igdb/image/upload";

const igdbUrl = (name: string) => `${IGDB_URL}/t_cover_big/${name}.jpg`;

const game = {
  id: 1,
  name: "Cover game",
  cover: { url: igdbUrl("default") },
} as unknown as Game;

const japanOption: GameCoverOptionResponseDto = {
  id: 12,
  kind: GameCoverOptionResponseDto.kind.LOCALIZED,
  label: "Japan",
  image: { id: 100, url: igdbUrl("japan") },
};

const alternativeOption: GameCoverOptionResponseDto = {
  id: 18,
  kind: GameCoverOptionResponseDto.kind.ALTERNATIVE,
  label: null,
  image: { id: 200, url: igdbUrl("alternative") },
};

const DEFAULT_LABEL = "game.coverPicker.default";
const JAPAN_LABEL = "Japan";
const ALTERNATIVE_LABEL = "game.coverPicker.kinds.alternative";
const SIGN_IN_PROMPT = "game.coverPicker.signInTitle";

function signIn() {
  mocks.session = { data: { user: { id: "viewer" } }, isPending: false };
}

function signOut() {
  mocks.session = { data: null, isPending: false };
}

function apiError(status: number) {
  return new ApiError(
    {} as never,
    {
      url: "/v1/game/cover/1/mine",
      ok: false,
      status,
      statusText: "Error",
      body: {},
    } as never,
    "Request failed",
  );
}

function createClient(withAuthCache = false) {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, retryDelay: 0 } },
    ...(withAuthCache
      ? { mutationCache: new MutationCache({ onError: handleAuthError }) }
      : {}),
  });
}

function createWrapper(client: QueryClient) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <MantineProvider>
      <QueryClientProvider client={client}>
        <UIProvider
          hooks={{
            useRouter: () => ({
              back: () => {},
              pathname: "/game/1",
              asPath: "/game/1",
              push: mocks.push,
              query: new URLSearchParams(),
            }),
          }}
        >
          {children}
        </UIProvider>
      </QueryClientProvider>
    </MantineProvider>
  );
  Wrapper.displayName = "GameCoverPickerWrapper";
  return Wrapper;
}

interface MockOptions {
  options?: GameCoverOptionResponseDto[];
  choice?: number | null;
  mode?: string;
}

function mockServices({
  options = [japanOption, alternativeOption],
  choice = null,
  mode = "any",
}: MockOptions = {}) {
  const findOptions = vi
    .spyOn(GameCoverService, "gameCoverControllerFindOptionsV1")
    .mockResolvedValue(options);
  const findMine = vi
    .spyOn(GameCoverService, "gameCoverControllerFindMineV1")
    .mockResolvedValue({ coverOptionId: choice });
  vi.spyOn(
    GameCoverService,
    "gameCoverControllerRemoveMineV1",
  ).mockResolvedValue({});
  const setMine = vi
    .spyOn(GameCoverService, "gameCoverControllerSetMineV1")
    .mockResolvedValue({ coverOptionId: 12 });
  vi.spyOn(ProfileService, "profileControllerFindOneByIdV1").mockResolvedValue({
    customCoverMode: mode,
  } as ProfileResponseDto);

  return { findOptions, findMine, setMine };
}

function renderPicker(client = createClient()) {
  return render(<GameCoverPickerModal game={game} opened onClose={vi.fn()} />, {
    wrapper: createWrapper(client),
  });
}

function ariaPressed(element: HTMLElement) {
  return element.getAttribute("aria-pressed");
}

beforeEach(() => {
  signIn();
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
  signOut();
  notifications.show.mockClear();
  mocks.getSession.mockClear();
  mocks.push.mockClear();
});

describe("GameCoverPickerModal", () => {
  it("lists every option with its label, or a translated kind name when the label is null", async () => {
    mockServices();
    renderPicker();

    expect(
      await screen.findByRole("button", { name: JAPAN_LABEL }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: ALTERNATIVE_LABEL }),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: DEFAULT_LABEL })).toBeTruthy();
  });

  it("marks the stored option as selected", async () => {
    mockServices({ choice: 12 });
    renderPicker();

    const japan = await screen.findByRole("button", { name: JAPAN_LABEL });
    await waitFor(() => expect(ariaPressed(japan)).toBe("true"));
    expect(
      ariaPressed(screen.getByRole("button", { name: DEFAULT_LABEL })),
    ).toBe("false");
  });

  it("marks the default cover as selected when no choice is stored", async () => {
    mockServices({ choice: null });
    renderPicker();

    const defaultTile = await screen.findByRole("button", {
      name: DEFAULT_LABEL,
    });
    await waitFor(() => expect(ariaPressed(defaultTile)).toBe("true"));
    expect(ariaPressed(screen.getByRole("button", { name: JAPAN_LABEL }))).toBe(
      "false",
    );
  });

  it("states that no alternative covers exist and offers no choice when the list is empty", async () => {
    mockServices({ options: [] });
    renderPicker();

    expect(await screen.findByText("game.coverPicker.empty")).toBeTruthy();
    expect(screen.queryByRole("button", { name: DEFAULT_LABEL })).toBeNull();
  });

  it("shows a placeholder for an option image that fails, without a fallback fetch", async () => {
    mockServices();
    const findOne = vi.spyOn(
      GameRepositoryService,
      "gameRepositoryControllerFindOneByIdV1",
    );
    renderPicker();

    const image = await screen.findByRole("img", { name: JAPAN_LABEL });
    fireEvent.error(image);

    await waitFor(() =>
      expect(image.getAttribute("src")).toBe(GAME_COVER_PLACEHOLDER),
    );
    expect(findOne).not.toHaveBeenCalled();
  });

  it("explains mode none and still stores a choice", async () => {
    const { setMine } = mockServices({ mode: "none" });
    renderPicker();

    expect(
      await screen.findByText("game.coverPicker.modeNoneNotice"),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: JAPAN_LABEL }));

    await waitFor(() =>
      expect(setMine).toHaveBeenCalledWith(1, { coverOptionId: 12 }),
    );
  });

  it("shows the new selection and refreshes the game covers after a successful choice", async () => {
    const { setMine, findMine } = mockServices({ choice: null });
    renderPicker();

    const japan = await screen.findByRole("button", { name: JAPAN_LABEL });
    const defaultTile = await screen.findByRole("button", {
      name: DEFAULT_LABEL,
    });
    await waitFor(() => expect(ariaPressed(defaultTile)).toBe("true"));

    // The invalidated choice query returns the stored value on the next read.
    findMine.mockResolvedValue({ coverOptionId: 12 });
    setMine.mockResolvedValue({ coverOptionId: 12 });
    fireEvent.click(japan);

    await waitFor(() => expect(ariaPressed(japan)).toBe("true"));
    expect(ariaPressed(defaultTile)).toBe("false");
  });

  it("keeps the previous selection and notifies on a rejected option", async () => {
    const { setMine } = mockServices({ choice: null });
    setMine.mockRejectedValue(apiError(400));
    renderPicker();

    const japan = await screen.findByRole("button", { name: JAPAN_LABEL });
    fireEvent.click(japan);

    await waitFor(() => expect(notifications.show).toHaveBeenCalled());
    expect(ariaPressed(japan)).toBe("false");
    expect(
      ariaPressed(screen.getByRole("button", { name: DEFAULT_LABEL })),
    ).toBe("true");
    expect(screen.queryByText(SIGN_IN_PROMPT)).toBeNull();
  });

  it("asks a signed-out visitor to sign in without sending a request", async () => {
    signOut();
    const { setMine, findMine } = mockServices();
    renderPicker();

    fireEvent.click(await screen.findByRole("button", { name: JAPAN_LABEL }));

    expect(await screen.findByText(SIGN_IN_PROMPT)).toBeTruthy();
    expect(setMine).not.toHaveBeenCalled();
    expect(findMine).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "actions.login" }));
    expect(mocks.push).toHaveBeenCalledWith("/auth?redirectTo=%2Fgame%2F1", {
      absolute: true,
    });
  });

  it("asks a signed-in viewer to sign in again on a 401 without redirecting", async () => {
    const { setMine } = mockServices({ choice: null });
    setMine.mockRejectedValue(apiError(401));
    const client = createClient(true);
    renderPicker(client);

    const japan = await screen.findByRole("button", { name: JAPAN_LABEL });
    fireEvent.click(japan);

    expect(await screen.findByText(SIGN_IN_PROMPT)).toBeTruthy();
    expect(ariaPressed(japan)).toBe("false");
    expect(
      ariaPressed(screen.getByRole("button", { name: DEFAULT_LABEL })),
    ).toBe("true");
    // The mutation skips the global handler, so no session refetch can redirect.
    expect(mocks.getSession).not.toHaveBeenCalled();
    expect(mocks.push).not.toHaveBeenCalled();
  });
});

describe("handleAuthError", () => {
  it("skips the session refetch for mutations that show their own prompt", () => {
    handleAuthError(apiError(401), {}, undefined, {
      meta: { skipAuthError: true },
    } as never);
    expect(mocks.getSession).not.toHaveBeenCalled();

    handleAuthError(apiError(401), {}, undefined, { meta: {} } as never);
    expect(mocks.getSession).toHaveBeenCalledTimes(1);
  });
});
