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
  ProfileService,
  type AwardsCategory,
  type AwardsCategoryResult,
  type AwardsCategoryResultWinner,
  type AwardsEventDto,
  type CurrentAwardsEventDto,
  type Game,
  type ProfileResponseDto,
} from "@repo/wrapper/server";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AwardsResultsScreen } from "../../../../../packages/ui/src/components/awards/results/AwardsResultsScreen";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";
import type { LinkComponentProps } from "../../../../../packages/ui/src/util/link";
import type { ModalComponentProps } from "../../../../../packages/ui/src/util/modal";
import { DEFAULT_MANTINE_THEME } from "../../../../../packages/ui/src/util/theme";

const EVENT_ID = 12;
const YEAR = 2026;

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
  pathname: `/awards/${YEAR}/result`,
  asPath: `/awards/${YEAR}/result`,
  back: () => {},
  push: vi.fn(async () => {}),
  query: new URLSearchParams(),
};

const shareText = vi.fn(async (_text: string) => true);

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
  ui: ReactElement = <AwardsResultsScreen eventYear={YEAR} />,
  language: SupportedLanguage = "pt-BR",
) {
  return render(
    <I18nProvider language={language}>
      <MantineProvider theme={DEFAULT_MANTINE_THEME}>
        <QueryClientProvider client={createClient()}>
          <UIProvider
            presenters={{ Modal: TestModal, Link: TestLink }}
            hooks={{ useRouter: () => router, shareText }}
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
    id: EVENT_ID,
    year: YEAR,
    phase,
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
  isGOTY = false,
  isPersonalGOTY = false,
  translations = [],
}: {
  id: number;
  name: string;
  order: number;
  isGOTY?: boolean;
  isPersonalGOTY?: boolean;
  translations?: AwardsCategoryTranslationDto[];
}): AwardsCategory {
  return {
    id,
    eventId: EVENT_ID,
    name,
    order,
    description: `${name} description`,
    translations,
    isGOTY,
    isPersonalGOTY,
    nomineeCount: 6,
    nomineesFinalizedAt: null,
    suggestions: [],
    createdAt: "2026-10-01T12:00:00.000Z",
    updatedAt: "2026-11-15T12:00:00.000Z",
    deletedAt: null,
  } as unknown as AwardsCategory;
}

function buildWinner({
  id,
  gameId,
  position,
  votesPercentage,
  playedVotesPercentage,
}: {
  id: number;
  gameId: number;
  position: number;
  votesPercentage: number;
  playedVotesPercentage: number;
}): AwardsCategoryResultWinner {
  return {
    id,
    resultId: id,
    gameId,
    position,
    totalVotes: 100,
    votesPercentage,
    playedVotes: 50,
    playedVotesPercentage,
  } as unknown as AwardsCategoryResultWinner;
}

function buildResult({
  id,
  category,
  winners,
  totalVotesCount = 1000,
  totalPlayedVotesCount = 600,
}: {
  id: number;
  category: AwardsCategory;
  winners: AwardsCategoryResultWinner[];
  totalVotesCount?: number;
  totalPlayedVotesCount?: number;
}): AwardsCategoryResult {
  return {
    id,
    totalVotesCount,
    totalUniqueGamesSubmitted: winners.length,
    totalUsersParticipating: 800,
    totalPlayedVotesCount,
    categoryId: category.id,
    category,
    winners,
  } as unknown as AwardsCategoryResult;
}

function buildGame(id: number, name: string): Game {
  return { id, name, cover: null } as unknown as Game;
}

const GOTY = buildCategory({
  id: 40,
  name: "Jogo do Ano",
  order: 0,
  isGOTY: true,
});
const NARRATIVA = buildCategory({ id: 41, name: "Narrativa", order: 2 });
const ARTE = buildCategory({ id: 42, name: "Direção de Arte", order: 1 });
const PERSONAL = buildCategory({
  id: 99,
  name: "Seu GOTY pessoal",
  order: 3,
  isPersonalGOTY: true,
});

const GAMES = [
  buildGame(101, "Resident Evil Requiem"),
  buildGame(102, "Saros"),
  buildGame(103, "Nioh 3"),
  buildGame(104, "Pragmata"),
];

/** Server order is category id ascending, not `category.order`. */
const RESULTS: AwardsCategoryResult[] = [
  buildResult({
    id: 701,
    category: NARRATIVA,
    winners: [
      buildWinner({
        id: 7011,
        gameId: 102,
        position: 1,
        votesPercentage: 0.4,
        playedVotesPercentage: 0.3,
      }),
    ],
  }),
  buildResult({
    id: 700,
    category: GOTY,
    totalVotesCount: 4812,
    winners: [
      buildWinner({
        id: 7001,
        gameId: 101,
        position: 1,
        votesPercentage: 0.31,
        playedVotesPercentage: 0.29,
      }),
      buildWinner({
        id: 7002,
        gameId: 102,
        position: 2,
        votesPercentage: 0.22,
        playedVotesPercentage: 0.27,
      }),
      buildWinner({
        id: 7003,
        gameId: 103,
        position: 3,
        votesPercentage: 0.14,
        playedVotesPercentage: 0.2,
      }),
    ],
  }),
  buildResult({
    id: 702,
    category: ARTE,
    winners: [
      buildWinner({
        id: 7021,
        gameId: 104,
        position: 1,
        votesPercentage: 0.5,
        playedVotesPercentage: 0.4,
      }),
    ],
  }),
  buildResult({
    id: 704,
    category: PERSONAL,
    winners: [
      buildWinner({
        id: 7041,
        gameId: 103,
        position: 1,
        votesPercentage: 0.4,
        playedVotesPercentage: 0.4,
      }),
    ],
  }),
];

interface LoadOptions {
  phase?: string;
  results?: AwardsCategoryResult[];
  scoreboard?: Record<string, unknown> | null;
  profileUsername?: string;
}

function loadEvent({
  phase = "results",
  results = RESULTS,
  scoreboard,
  profileUsername = "Cassiano",
}: LoadOptions = {}) {
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
    categoriesCount: results.length,
  } as unknown as CurrentAwardsEventDto);
  vi.spyOn(
    AwardsService,
    "awardsControllerGetResultsByEventIdV1",
  ).mockResolvedValue(results);
  vi.spyOn(
    GameRepositoryService,
    "gameRepositoryControllerFindAllByIdsV1",
  ).mockResolvedValue(GAMES);
  vi.spyOn(
    ProfileService,
    "profileControllerFindOneByIdV1",
  ).mockResolvedValue({
    id: "abc",
    username: profileUsername,
  } as unknown as ProfileResponseDto);

  const getScoreboard = vi.spyOn(
    AwardsService,
    "awardsControllerGetScoreboardV1",
  );

  if (scoreboard === null) {
    getScoreboard.mockRejectedValue(apiError(404));
  } else if (scoreboard) {
    getScoreboard.mockResolvedValue(scoreboard);
  }

  return { getScoreboard };
}

function scoreboardCategories(
  outcomes: Array<{
    categoryId: number;
    votedGameId: number | null;
    winningGameId: number | null;
    outcome: "hit" | "miss" | "not_voted";
  }>,
) {
  return outcomes;
}

const SCOREBOARD = {
  totals: { hits: 1, voted: 2, scorable: 3 },
  categories: scoreboardCategories([
    { categoryId: 40, votedGameId: 101, winningGameId: 101, outcome: "hit" },
    { categoryId: 41, votedGameId: 103, winningGameId: 102, outcome: "miss" },
    {
      categoryId: 42,
      votedGameId: null,
      winningGameId: 104,
      outcome: "not_voted",
    },
  ]),
  personalGOTY: { gameId: 103, otherUsersCount: 312 },
};

function winnerCardCategoryIds(container: HTMLElement): Array<string | null> {
  return Array.from(
    container.querySelectorAll("[data-awards-results-winner-card]"),
  ).map((card) => card.getAttribute("data-category-id"));
}

function voteRowGameIds(container: HTMLElement): Array<string | null> {
  return Array.from(
    container.querySelectorAll("[data-awards-results-vote-row]"),
  ).map((row) => row.getAttribute("data-game-id"));
}

beforeEach(() => {
  vi.clearAllMocks();
  session.userId = undefined;
  router.query = new URLSearchParams();
  shareText.mockResolvedValue(true);
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

describe("AwardsResultsScreen", () => {
  it("features the GOTY winner and orders the category winners by category.order", async () => {
    loadEvent();

    const { container } = renderScreen();

    await waitFor(() => expect(screen.getByText("31%")).toBeTruthy());
    await waitFor(
      () =>
        expect(
          screen.getByText("Resident Evil Requiem é o Jogo do Ano."),
        ).toBeTruthy(),
      { timeout: 5000 },
    );

    expect(
      screen.getByText("Resultado · Jogo do Ano · 4.812 votos"),
    ).toBeTruthy();
    expect(screen.getByText("31%")).toBeTruthy();
    expect(screen.getByText("22%")).toBeTruthy();
    expect(winnerCardCategoryIds(container)).toEqual(["42", "41"]);
    expect(voteRowGameIds(container)).toEqual(["101", "102", "103"]);
    expect(screen.queryByText("Seu placar")).toBeNull();
  });

  it("switches the vote list to played-only and shows the dispute note", async () => {
    loadEvent();

    const { container } = renderScreen();

    await waitFor(() => expect(screen.getByText("31%")).toBeTruthy());

    fireEvent.click(screen.getByText("Só quem jogou"));

    await waitFor(() => expect(screen.getByText("29%")).toBeTruthy());

    expect(screen.getByText("27%")).toBeTruthy();
    expect(screen.queryByText("31%")).toBeNull();
    expect(voteRowGameIds(container)).toEqual(["101", "102", "103"]);
    expect(
      screen.getByText(
        "Contando só quem jogou, a disputa aperta: Resident Evil Requiem 29%, Saros 27%.",
      ),
    ).toBeTruthy();
  });

  it("omits the played toggle and the dispute note for an old event", async () => {
    loadEvent({
      results: [
        buildResult({
          id: 700,
          category: GOTY,
          totalVotesCount: 900,
          totalPlayedVotesCount: 0,
          winners: [
            buildWinner({
              id: 7001,
              gameId: 101,
              position: 1,
              votesPercentage: 0.45,
              playedVotesPercentage: 0,
            }),
            buildWinner({
              id: 7002,
              gameId: 102,
              position: 2,
              votesPercentage: 0.3,
              playedVotesPercentage: 0,
            }),
          ],
        }),
      ],
    });

    const { container } = renderScreen();

    await waitFor(() =>
      expect(screen.getByText("45%")).toBeTruthy(),
    );

    expect(screen.queryByText("Só quem jogou")).toBeNull();
    expect(
      container.querySelector("[data-awards-results-dispute]"),
    ).toBeNull();
    expect(screen.getByText("30%")).toBeTruthy();
  });

  it("shows the results date instead of winners when the read is empty", async () => {
    loadEvent({ phase: "voting_closed", results: [] });

    renderScreen();

    await waitFor(() =>
      expect(
        screen.getByText("O resultado sai em 27 de dezembro de 2026."),
      ).toBeTruthy(),
    );

    expect(screen.queryByText(/é o Jogo do Ano/)).toBeNull();
    expect(
      screen.queryByText("Vencedores por categoria"),
    ).toBeNull();
  });

  it("keeps the results date when the results phase returns no results", async () => {
    loadEvent({ phase: "results", results: [] });

    renderScreen();

    await waitFor(() =>
      expect(
        screen.getByText("O resultado sai em 27 de dezembro de 2026."),
      ).toBeTruthy(),
    );

    expect(screen.queryByText(/é o Jogo do Ano/)).toBeNull();
    expect(
      screen.queryByText("Vencedores por categoria"),
    ).toBeNull();
  });

  it("shows the scoreboard totals and the hit, miss and not-voted chips", async () => {
    session.userId = "user-1";
    const { getScoreboard } = loadEvent({ scoreboard: SCOREBOARD });

    const { container } = renderScreen();

    await waitFor(() =>
      expect(
        screen.getByText("Você acertou 1 de 3 categorias."),
      ).toBeTruthy(),
    );

    expect(getScoreboard).toHaveBeenCalledWith(EVENT_ID, "user-1");
    expect(screen.getByText("Seu placar")).toBeTruthy();
    expect(screen.getByText("Seu voto venceu")).toBeTruthy();
    expect(screen.getByText("Seu voto: Nioh 3")).toBeTruthy();
    expect(screen.getByText("Você não votou")).toBeTruthy();
    expect(screen.getByText("Seu GOTY pessoal")).toBeTruthy();
    expect(
      screen.getByText(
        "Também é o GOTY pessoal de 312 outras pessoas no GameNode.",
      ),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Compartilhar meu placar" }),
    ).toBeTruthy();
    expect(
      container.querySelectorAll("[data-awards-results-vote-chip]"),
    ).toHaveLength(3);
  });

  it("omits the other-people sentence when the personal GOTY count is zero", async () => {
    session.userId = "user-1";
    loadEvent({
      scoreboard: {
        totals: { hits: 0, voted: 0, scorable: 2 },
        categories: [],
        personalGOTY: { gameId: 103, otherUsersCount: 0 },
      },
    });

    const { container } = renderScreen();

    await waitFor(() =>
      expect(
        screen.getByText("Você acertou 0 de 2 categorias."),
      ).toBeTruthy(),
    );

    const card = container.querySelector(
      "[data-awards-results-personal-goty]",
    );
    expect(card).not.toBeNull();
    expect(card?.textContent).toContain("Seu GOTY pessoal");
    expect(card?.textContent).toContain("Nioh 3");
    expect(card?.textContent).not.toContain("Também é o GOTY pessoal");
  });

  it("omits the scoreboard and its chips when the scoreboard answers 404", async () => {
    session.userId = "user-1";
    loadEvent({ scoreboard: null });

    const { container } = renderScreen();

    await waitFor(() => expect(screen.getByText("31%")).toBeTruthy());
    await waitFor(
      () =>
        expect(
          screen.getByText("Resident Evil Requiem é o Jogo do Ano."),
        ).toBeTruthy(),
      { timeout: 5000 },
    );

    await waitFor(() =>
      expect(
        container.querySelectorAll("[data-awards-results-vote-chip]"),
      ).toHaveLength(0),
    );

    expect(screen.queryByText("Seu placar")).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Compartilhar meu placar" }),
    ).toBeNull();
    expect(notifications.show).not.toHaveBeenCalled();
  });

  it("shows only the public result to a visitor without a scoreboard", async () => {
    const { getScoreboard } = loadEvent();

    renderScreen();

    await waitFor(() => expect(screen.getByText("31%")).toBeTruthy());
    await waitFor(
      () =>
        expect(
          screen.getByText("Resident Evil Requiem é o Jogo do Ano."),
        ).toBeTruthy(),
      { timeout: 5000 },
    );

    expect(getScoreboard).not.toHaveBeenCalled();
    expect(screen.queryByText("Seu placar")).toBeNull();
    expect(screen.queryByText("Seu voto venceu")).toBeNull();
    expect(screen.queryByText("Você não votou")).toBeNull();
  });

  it("reads the scoreboard of the user in the shared link and names the profile", async () => {
    router.query = new URLSearchParams("user=abc");
    const { getScoreboard } = loadEvent({
      scoreboard: {
        totals: { hits: 7, voted: 8, scorable: 11 },
        categories: scoreboardCategories([
          { categoryId: 40, votedGameId: 101, winningGameId: 101, outcome: "hit" },
          {
            categoryId: 41,
            votedGameId: 102,
            winningGameId: 102,
            outcome: "hit",
          },
        ]),
        personalGOTY: null,
      },
      profileUsername: "Cassiano",
    });

    renderScreen();

    await waitFor(() =>
      expect(
        screen.getByText("Cassiano acertou 7 de 11 categorias."),
      ).toBeTruthy(),
    );

    expect(getScoreboard).toHaveBeenCalledWith(EVENT_ID, "abc");
    expect(
      ProfileService.profileControllerFindOneByIdV1,
    ).toHaveBeenCalledWith("abc");
    expect(screen.getByText("Seu placar")).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: "Compartilhar meu placar" }),
    ).toBeNull();
  });

  it("shares the scoreboard link with the signed-in user id", async () => {
    session.userId = "user-1";
    loadEvent({ scoreboard: SCOREBOARD });

    renderScreen();

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Compartilhar meu placar" }),
      ).toBeTruthy(),
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Compartilhar meu placar" }),
    );

    await waitFor(() => expect(shareText).toHaveBeenCalledTimes(1));

    expect(shareText.mock.calls[0][0]).toContain(
      "https://gamenode.app/awards/2026/result?user=user-1",
    );
  });

  it("shows the localized category name on a winner card", async () => {
    loadEvent({
      results: [
        buildResult({
          id: 702,
          category: buildCategory({
            id: 42,
            name: "Direção de Arte",
            order: 1,
            translations: [
              categoryTranslation(EN, "Art Direction", "Visual style."),
            ],
          }),
          winners: [
            buildWinner({
              id: 7021,
              gameId: 104,
              position: 1,
              votesPercentage: 0.5,
              playedVotesPercentage: 0.4,
            }),
          ],
        }),
        buildResult({
          id: 701,
          category: buildCategory({ id: 41, name: "Narrativa", order: 2 }),
          winners: [
            buildWinner({
              id: 7011,
              gameId: 102,
              position: 1,
              votesPercentage: 0.4,
              playedVotesPercentage: 0.3,
            }),
          ],
        }),
      ],
    });

    const { container } = renderScreen(undefined, "en");

    await waitFor(() =>
      expect(container.textContent).toContain("Art Direction"),
    );

    const card = container.querySelector(
      '[data-awards-results-winner-card][data-category-id="42"]',
    )!;
    expect(card.textContent).toContain("Art Direction");
    expect(card.textContent).not.toContain("Direção de Arte");

    // The category without an en entry keeps its base name.
    const fallbackCard = container.querySelector(
      '[data-awards-results-winner-card][data-category-id="41"]',
    )!;
    expect(fallbackCard.textContent).toContain("Narrativa");
  });
});
