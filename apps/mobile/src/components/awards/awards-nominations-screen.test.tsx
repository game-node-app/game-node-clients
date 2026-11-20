// @vitest-environment jsdom
import { MantineProvider } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { I18nProvider, type SupportedLanguage } from "@repo/locales";
import {
  ApiError,
  AwardsCategoryTranslationDto,
  AwardsService,
  GameRepositoryService,
  type AwardsEventDto,
  type CurrentAwardsEventDto,
  type Game,
  type VotableAwardsCategoryDto,
} from "@repo/wrapper/server";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AwardsMyNominations } from "../../../../../packages/ui/src/components/awards/types";
import { AwardsNominationsScreen } from "../../../../../packages/ui/src/components/awards/nominations/AwardsNominationsScreen";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";
import type { LinkComponentProps } from "../../../../../packages/ui/src/util/link";
import type { ModalComponentProps } from "../../../../../packages/ui/src/util/modal";
import { DEFAULT_MANTINE_THEME } from "../../../../../packages/ui/src/util/theme";

const session = vi.hoisted(() => ({
  userId: undefined as string | undefined,
}));

vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => session.userId }),
);

vi.mock("@mantine/notifications", () => ({
  notifications: { show: vi.fn() },
}));

vi.mock("../../../../../packages/ui/src/components/auth/authClient", () => ({
  authClient: {
    useSession: () => ({ data: null, isPending: false }),
  },
}));

vi.mock(
  "../../../../../packages/ui/src/components/awards/search/AwardsEligibleGameSearch",
  () => ({
    AwardsEligibleGameSearch: (props: {
      year: number;
      disabled?: boolean;
      selectedGameIds?: readonly number[];
      onSelect: (gameId: number) => void;
    }) => (
      <div
        data-awards-eligible-game-search
        data-year={props.year}
        data-disabled={props.disabled ? "true" : "false"}
      >
        {[205, 206].map((gameId) => (
          <button
            key={gameId}
            type="button"
            disabled={props.disabled}
            onClick={() => props.onSelect(gameId)}
          >
            {`select-${gameId}`}
          </button>
        ))}
      </div>
    ),
  }),
);

function TestModal({ opened, onClose, title, children }: ModalComponentProps) {
  if (!opened) {
    return null;
  }

  return (
    <div role="dialog">
      <span>{title}</span>
      <button type="button" onClick={onClose}>
        close
      </button>
      {children}
    </div>
  );
}

function TestLink({ href, children, ...rest }: LinkComponentProps) {
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}

const router = {
  pathname: "/awards/2026/nominations",
  asPath: "/awards/2026/nominations",
  back: () => {},
  push: vi.fn(async () => {}),
  query: new URLSearchParams(),
};

function createClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

const EN = AwardsCategoryTranslationDto.locale.EN;

function categoryTranslation(
  locale: AwardsCategoryTranslationDto.locale,
  name: string,
  description: string,
): AwardsCategoryTranslationDto {
  return { locale, name, description };
}

function renderScreen(
  ui: ReactElement = <AwardsNominationsScreen eventYear={2026} />,
  language: SupportedLanguage = "pt-BR",
) {
  return render(
    <I18nProvider language={language}>
      <MantineProvider theme={DEFAULT_MANTINE_THEME}>
        <QueryClientProvider client={createClient()}>
          <UIProvider
            presenters={{ Modal: TestModal, Link: TestLink }}
            hooks={{ useRouter: () => router }}
          >
            {ui}
          </UIProvider>
        </QueryClientProvider>
      </MantineProvider>
    </I18nProvider>,
  );
}

function stubMatchMedia() {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

function apiError(status: number) {
  return new ApiError(
    {} as unknown as ConstructorParameters<typeof ApiError>[0],
    {
      status,
      statusText: "",
      url: "/v1/awards",
      body: { message: `awards error ${status}` },
      ok: false,
    },
    `awards error ${status}`,
  );
}

function buildEvent(phase: string): AwardsEventDto {
  return {
    id: 12,
    year: 2026,
    phase,
    categoriesCount: 2,
    createdAt: "2026-10-01T12:00:00.000Z",
    updatedAt: "2026-11-15T12:00:00.000Z",
    deletedAt: null,
    votingStartDate: "2026-12-01T00:00:00.000Z",
    votingEndDate: "2026-12-20T23:59:59.000Z",
    resultsDate: "2026-12-27T00:00:00.000Z",
    nominationStartDate: "2026-11-20T00:00:00.000Z",
    nominationEndDate: "2026-11-28T23:59:59.000Z",
    eligibilityCutoffDate: "2026-11-30T00:00:00.000Z",
  } as unknown as AwardsEventDto;
}

function buildCategory({
  id,
  name,
  order,
  isPersonalGOTY = false,
  suggestionGameIds = [],
  translations = [],
}: {
  id: number;
  name: string;
  order: number;
  isPersonalGOTY?: boolean;
  suggestionGameIds?: number[];
  translations?: AwardsCategoryTranslationDto[];
}): VotableAwardsCategoryDto {
  return {
    id,
    eventId: 12,
    name,
    order,
    description: `${name} description`,
    translations,
    isGOTY: order === 0 && !isPersonalGOTY,
    isPersonalGOTY,
    nomineeCount: 3,
    nomineesFinalizedAt: null,
    isVotable: true,
    votingStartDate: "2026-12-01T00:00:00.000Z",
    votingEndDate: "2026-12-20T23:59:59.000Z",
    createdAt: "2026-10-01T12:00:00.000Z",
    updatedAt: "2026-11-15T12:00:00.000Z",
    deletedAt: null,
    suggestions: suggestionGameIds.map((gameId) => ({
      id: gameId,
      gameId,
      categoryId: id,
    })),
  } as unknown as VotableAwardsCategoryDto;
}

function buildGame(id: number, name: string): Game {
  return { id, name, cover: null } as unknown as Game;
}

interface LoadOptions {
  phase: string;
  categories: VotableAwardsCategoryDto[];
  nominations?: AwardsMyNominations[];
  games?: Game[];
  replace?: (categoryId: number, gameIds: number[]) => Promise<void>;
}

/** Stateful `nominations/me` so the post-mutation refetch shows the change. */
function loadEvent({
  phase,
  categories,
  nominations = [],
  games = [],
  replace,
}: LoadOptions) {
  let currentNominations = nominations;
  const event = buildEvent(phase);

  vi.spyOn(
    AwardsService,
    "awardsControllerGetEventsByYearV1",
  ).mockResolvedValue(event);
  vi.spyOn(
    AwardsService,
    "awardsControllerGetCurrentEventV1",
  ).mockResolvedValue({
    ...event,
    categoriesCount: categories.filter((category) => !category.isPersonalGOTY)
      .length,
  } as unknown as CurrentAwardsEventDto);
  vi.spyOn(
    AwardsService,
    "awardsControllerGetCategoriesByEventIdV1",
  ).mockResolvedValue(categories);

  const getNominations = vi
    .spyOn(AwardsService, "awardsNominationControllerGetMyNominationsV1")
    .mockImplementation((async () =>
      currentNominations.map((row) => ({
        categoryId: row.categoryId,
        gameIds: [...row.gameIds],
      }))) as never);

  const replaceNominations = vi
    .spyOn(AwardsService, "awardsNominationControllerReplaceNominationsV1")
    .mockImplementation((async (
      _eventId: number,
      categoryId: number,
      body: { gameIds: number[] },
    ) => {
      if (replace) {
        await replace(categoryId, body.gameIds);
      }
      currentNominations = currentNominations.some(
        (row) => row.categoryId === categoryId,
      )
        ? currentNominations.map((row) =>
            row.categoryId === categoryId
              ? { ...row, gameIds: body.gameIds }
              : row,
          )
        : [...currentNominations, { categoryId, gameIds: body.gameIds }];
    }) as never);

  const findAllByIds = vi
    .spyOn(GameRepositoryService, "gameRepositoryControllerFindAllByIdsV1")
    .mockResolvedValue(games);

  return { getNominations, replaceNominations, findAllByIds, event };
}

const BASE_CATEGORIES = [
  buildCategory({ id: 41, name: "Narrativa", order: 1 }),
  buildCategory({ id: 40, name: "Jogo do Ano", order: 0 }),
  buildCategory({
    id: 99,
    name: "Seu GOTY pessoal",
    order: 2,
    isPersonalGOTY: true,
  }),
];

beforeEach(() => {
  vi.clearAllMocks();
  session.userId = undefined;
  stubMatchMedia();
  if (!("ResizeObserver" in globalThis)) {
    class ResizeObserverStub {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    (globalThis as { ResizeObserver?: unknown }).ResizeObserver =
      ResizeObserverStub;
  }
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  session.userId = undefined;
});

describe("AwardsNominationsScreen", () => {
  it("lists the categories without the personal GOTY and adds a third game", async () => {
    session.userId = "user-1";
    const { replaceNominations } = loadEvent({
      phase: "nominations",
      categories: BASE_CATEGORIES,
      nominations: [{ categoryId: 40, gameIds: [101, 102] }],
      games: [
        buildGame(101, "Nioh 3"),
        buildGame(102, "Saros"),
        buildGame(205, "Pragmata"),
      ],
    });

    renderScreen();

    await waitFor(() => expect(screen.getByText("Nioh 3")).toBeTruthy());

    expect(screen.getAllByText("Jogo do Ano").length).toBeGreaterThan(0);
    expect(screen.getByText("1 de 2")).toBeTruthy();
    expect(screen.queryByText("Seu GOTY pessoal")).toBeNull();
    expect(screen.getAllByText("Sua indicação")).toHaveLength(2);

    fireEvent.click(screen.getByText("select-205"));

    await waitFor(() =>
      expect(replaceNominations).toHaveBeenCalledWith(12, 40, {
        gameIds: [101, 102, 205],
      }),
    );

    await waitFor(() => expect(screen.getByText("Pragmata")).toBeTruthy());
    expect(screen.getAllByText("Sua indicação")).toHaveLength(3);
    expect(
      screen.getByText("Você atingiu o limite de 3 jogos nesta categoria."),
    ).toBeTruthy();
    expect(
      screen
        .getByText("select-205")
        .closest("[data-awards-eligible-game-search]")
        ?.getAttribute("data-disabled"),
    ).toBe("true");
  });

  it("clears a category when its last game is removed", async () => {
    session.userId = "user-1";
    const { replaceNominations } = loadEvent({
      phase: "nominations",
      categories: BASE_CATEGORIES,
      nominations: [{ categoryId: 40, gameIds: [101] }],
      games: [buildGame(101, "Nioh 3")],
    });

    renderScreen();

    await waitFor(() => expect(screen.getByText("Nioh 3")).toBeTruthy());

    fireEvent.click(screen.getByRole("button", { name: "Remover" }));

    await waitFor(() =>
      expect(replaceNominations).toHaveBeenCalledWith(12, 40, {
        gameIds: [],
      }),
    );

    await waitFor(() => expect(screen.queryByText("Nioh 3")).toBeNull());
    expect(screen.getAllByText("0 de 3").length).toBeGreaterThan(0);
  });

  it("rolls the optimistic change back and notifies when the server rejects an ineligible game", async () => {
    session.userId = "user-1";
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { replaceNominations } = loadEvent({
      phase: "nominations",
      categories: BASE_CATEGORIES,
      nominations: [{ categoryId: 40, gameIds: [101, 102] }],
      games: [
        buildGame(101, "Nioh 3"),
        buildGame(102, "Saros"),
        buildGame(205, "Pragmata"),
      ],
      replace: async () => {
        throw apiError(400);
      },
    });

    renderScreen();

    await waitFor(() => expect(screen.getByText("Nioh 3")).toBeTruthy());

    fireEvent.click(screen.getByText("select-205"));

    await waitFor(() =>
      expect(replaceNominations).toHaveBeenCalledWith(12, 40, {
        gameIds: [101, 102, 205],
      }),
    );

    await waitFor(() =>
      expect(notifications.show).toHaveBeenCalledWith(
        expect.objectContaining({ color: "red" }),
      ),
    );

    await waitFor(() => expect(screen.queryByText("Pragmata")).toBeNull());
    expect(screen.getByText("Nioh 3")).toBeTruthy();
    expect(screen.getByText("Saros")).toBeTruthy();
    expect(screen.getByText("2 de 3")).toBeTruthy();
  });

  it("shows the final nominees and the user picks read-only after nominations close", async () => {
    session.userId = "user-1";
    const { replaceNominations, findAllByIds } = loadEvent({
      phase: "nominations_closed",
      categories: [
        buildCategory({
          id: 40,
          name: "Jogo do Ano",
          order: 0,
          suggestionGameIds: [101, 102],
        }),
        buildCategory({
          id: 41,
          name: "Narrativa",
          order: 1,
          suggestionGameIds: [206],
        }),
        buildCategory({
          id: 99,
          name: "Seu GOTY pessoal",
          order: 2,
          isPersonalGOTY: true,
        }),
      ],
      nominations: [{ categoryId: 40, gameIds: [101] }],
      games: [
        buildGame(101, "Nioh 3"),
        buildGame(102, "Saros"),
        buildGame(206, "Pragmata"),
      ],
    });

    const { container } = renderScreen();

    await waitFor(() =>
      expect(screen.getByText("Indicados finais")).toBeTruthy(),
    );

    await waitFor(() => expect(screen.getAllByText("Nioh 3")).toHaveLength(2));

    expect(screen.getByText("Saros")).toBeTruthy();
    expect(screen.getByText("Suas indicações")).toBeTruthy();
    expect(
      screen.getByText(
        "As indicações estão encerradas. Estes são os indicados finais.",
      ),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-awards-eligible-game-search]"),
    ).toBeNull();
    expect(screen.queryByRole("button", { name: "Remover" })).toBeNull();
    expect(screen.queryByText("Seu GOTY pessoal")).toBeNull();
    expect(replaceNominations).not.toHaveBeenCalled();
    expect(findAllByIds).toHaveBeenCalledTimes(1);
    expect(findAllByIds.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        gameIds: expect.arrayContaining([101, 102, 206]),
      }),
    );
  });

  it("shows the nomination opening date before the phase and does not read nominations/me", async () => {
    session.userId = "user-1";
    const { getNominations } = loadEvent({
      phase: "upcoming",
      categories: BASE_CATEGORIES,
    });

    const { container } = renderScreen();

    await waitFor(() =>
      expect(
        screen.getByText("As indicações abrem em 20 de nov."),
      ).toBeTruthy(),
    );

    expect(
      container.querySelector("[data-awards-eligible-game-search]"),
    ).toBeNull();
    expect(getNominations).not.toHaveBeenCalled();
  });

  it("shows the public categories and a sign-in action to visitors without reading nominations/me", async () => {
    const { getNominations } = loadEvent({
      phase: "nominations",
      categories: BASE_CATEGORIES,
    });

    const { container } = renderScreen();

    await waitFor(() =>
      expect(screen.getAllByText("Jogo do Ano").length).toBeGreaterThan(0),
    );

    expect(screen.getByText("Narrativa")).toBeTruthy();
    expect(screen.getByText("Entrar para indicar")).toBeTruthy();
    expect(screen.getByText("0 de 2")).toBeTruthy();
    expect(
      container.querySelector("[data-awards-eligible-game-search]"),
    ).toBeNull();
    expect(getNominations).not.toHaveBeenCalled();
  });

  it("moves between categories with the previous and next buttons", async () => {
    session.userId = "user-1";
    window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
    loadEvent({
      phase: "nominations",
      categories: [
        ...BASE_CATEGORIES,
        buildCategory({ id: 42, name: "Arte", order: 3 }),
      ],
    });

    const { container } = renderScreen();

    const panelName = () =>
      container.querySelector("[data-awards-category-panel]")?.textContent ??
      "";
    const next = () =>
      container.querySelector<HTMLButtonElement>(
        "[data-awards-nominations-next]",
      );
    const previous = () =>
      container.querySelector<HTMLButtonElement>(
        "[data-awards-nominations-previous]",
      );

    await waitFor(() => expect(next()).toBeTruthy());

    // First category: nothing to go back to.
    expect(previous()).toBeNull();
    expect(panelName()).toContain("Jogo do Ano");

    fireEvent.click(next()!);
    await waitFor(() => expect(panelName()).toContain("Narrativa"));
    expect(previous()).toBeTruthy();

    fireEvent.click(next()!);
    await waitFor(() => expect(panelName()).toContain("Arte"));

    // Last category: nothing to advance to.
    expect(next()).toBeNull();

    fireEvent.click(previous()!);
    await waitFor(() => expect(panelName()).toContain("Narrativa"));
  });

  it("shows the localized category name and description", async () => {
    session.userId = "user-1";
    loadEvent({
      phase: "nominations",
      categories: [
        buildCategory({
          id: 40,
          name: "Jogo do Ano",
          order: 0,
          translations: [
            categoryTranslation(EN, "Game of the Year", "The main award."),
          ],
        }),
        buildCategory({ id: 41, name: "Narrativa", order: 1 }),
      ],
    });

    const { container } = renderScreen(undefined, "en");

    await waitFor(() =>
      expect(container.textContent).toContain("Game of the Year"),
    );

    const rows = Array.from(
      container.querySelectorAll("[data-awards-category-row]"),
    );
    expect(rows[0]?.textContent).toContain("Game of the Year");
    expect(rows[0]?.textContent).not.toContain("Jogo do Ano");
    // The category without an en entry keeps its base name.
    expect(rows[1]?.textContent).toContain("Narrativa");

    const panel = container.querySelector("[data-awards-category-panel]")!;
    expect(panel.textContent).toContain("Game of the Year");
    expect(panel.textContent).toContain("The main award.");
    expect(panel.textContent).not.toContain("Jogo do Ano description");
  });
});
