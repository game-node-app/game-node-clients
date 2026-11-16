// @vitest-environment jsdom
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import {
  I18nProvider,
  useI18nContext,
  type SupportedLanguage,
} from "@repo/locales";
import {
  ApiError,
  AwardsCategoryTranslationDto,
  AwardsService,
  GameRepositoryService,
  type AwardsBallotCategoryDto,
  type AwardsBallotDto,
  type AwardsEventDto,
  type CurrentAwardsEventDto,
  type Game,
  type VotableAwardsCategoryDto,
} from "@repo/wrapper/server";
import type { ReactElement, ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AwardsBallotScreen } from "../../../../../packages/ui/src/components/awards/ballot/AwardsBallotScreen";
import type { AwardsNomineeStatus } from "../../../../../packages/ui/src/components/awards/types";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";
import type { LinkComponentProps } from "../../../../../packages/ui/src/util/link";
import type { ModalComponentProps } from "../../../../../packages/ui/src/util/modal";
import { DEFAULT_MANTINE_THEME } from "../../../../../packages/ui/src/util/theme";

const session = vi.hoisted(() => ({
  userId: undefined as string | undefined,
}));

const shareText = vi.fn(async (_text: string) => true);

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
        data-selected={props.selectedGameIds?.join(",") ?? ""}
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
  pathname: "/awards/2026/vote",
  asPath: "/awards/2026/vote",
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
const PT_BR = AwardsCategoryTranslationDto.locale.PT_BR;

function categoryTranslation(
  locale: AwardsCategoryTranslationDto.locale,
  name: string,
  description: string,
): AwardsCategoryTranslationDto {
  return { locale, name, description };
}

function LanguageSwitcher({ language }: { language: SupportedLanguage }) {
  const { setLanguage } = useI18nContext();

  return (
    <button type="button" onClick={() => setLanguage(language)}>
      {`switch-to-${language}`}
    </button>
  );
}

interface RenderOptions {
  language?: SupportedLanguage;
  controls?: ReactNode;
}

function renderScreen(
  ui: ReactElement = <AwardsBallotScreen eventYear={2026} />,
  { language = "pt-BR", controls }: RenderOptions = {},
) {
  return render(
    <I18nProvider language={language}>
      <MantineProvider theme={DEFAULT_MANTINE_THEME}>
        <QueryClientProvider client={createClient()}>
          <UIProvider
            presenters={{ Modal: TestModal, Link: TestLink }}
            hooks={{ useRouter: () => router, shareText }}
          >
            {controls}
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

function buildEvent(phase: string, year = 2026): AwardsEventDto {
  return {
    id: 12,
    year,
    phase,
    categoriesCount: 3,
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
}): VotableAwardsCategoryDto {
  return {
    id,
    eventId: 12,
    name,
    order,
    description: `${name} description`,
    translations,
    isGOTY,
    isPersonalGOTY,
    nomineeCount: 6,
    nomineesFinalizedAt: null,
    isVotable: true,
    votingStartDate: "2026-12-01T00:00:00.000Z",
    votingEndDate: "2026-12-20T23:59:59.000Z",
    createdAt: "2026-10-01T12:00:00.000Z",
    updatedAt: "2026-11-15T12:00:00.000Z",
    deletedAt: null,
    suggestions: [],
  } as unknown as VotableAwardsCategoryDto;
}

function buildGame(
  id: number,
  name: string,
  {
    developer = "Koei Tecmo",
    platform = "PS5",
  }: { developer?: string; platform?: string } = {},
): Game {
  return {
    id,
    name,
    cover: null,
    platforms: [{ id: 1, abbreviation: platform, name: platform }],
    involvedCompanies: [
      {
        developer: true,
        publisher: false,
        company: { id: 1, name: developer },
      },
    ],
  } as unknown as Game;
}

interface NomineeInput {
  gameId: number;
  status: AwardsNomineeStatus;
  playtimeSeconds?: number;
  rating?: number | null;
}

interface BallotCategoryInput {
  id: number;
  name: string;
  order: number;
  isPersonalGOTY?: boolean;
  voteGameId?: number | null;
  suggestedGameId?: number | null;
  nominees?: NomineeInput[];
  translations?: AwardsCategoryTranslationDto[];
}

function toBallotCategory(
  category: BallotCategoryInput,
): AwardsBallotCategoryDto {
  const nominees = category.nominees ?? [];

  return {
    id: category.id,
    name: category.name,
    description: `${category.name} description`,
    order: category.order,
    isPersonalGOTY: category.isPersonalGOTY ?? false,
    translations: category.translations ?? [],
    voteGameId: category.voteGameId ?? null,
    playedNomineesCount: nominees.filter(
      (nominee) => nominee.status === "played",
    ).length,
    suggestedGameId: category.suggestedGameId ?? null,
    nominees: nominees.map((nominee) => ({
      gameId: nominee.gameId,
      status: nominee.status,
      playtimeSeconds: nominee.playtimeSeconds ?? 0,
      rating: nominee.rating ?? null,
    })),
  } as unknown as AwardsBallotCategoryDto;
}

interface LoadOptions {
  phase: string;
  year?: number;
  categories: BallotCategoryInput[];
  readCategories?: VotableAwardsCategoryDto[];
  games?: Game[];
  ballotError?: ApiError;
}

function loadScreen({
  phase,
  year = 2026,
  categories,
  readCategories,
  games = [],
  ballotError,
}: LoadOptions) {
  const event = buildEvent(phase, year);
  const ballot: AwardsBallotDto = {
    eventId: 12,
    year,
    phase,
    categoriesVoted: categories.filter(
      (category) => category.voteGameId != null,
    ).length,
    categoriesTotal: categories.length,
    categories: categories.map(toBallotCategory),
  } as unknown as AwardsBallotDto;

  let currentBallot = ballot;

  vi.spyOn(
    AwardsService,
    "awardsControllerGetEventsByYearV1",
  ).mockResolvedValue(event);
  vi.spyOn(
    AwardsService,
    "awardsControllerGetCurrentEventV1",
  ).mockResolvedValue(event as unknown as CurrentAwardsEventDto);
  const getCategories = vi
    .spyOn(AwardsService, "awardsControllerGetCategoriesByEventIdV1")
    .mockResolvedValue(
      readCategories ??
        categories.map((category) =>
          buildCategory({
            id: category.id,
            name: category.name,
            order: category.order,
            isGOTY:
              category.order === 0 && !category.isPersonalGOTY,
            isPersonalGOTY: category.isPersonalGOTY,
            translations: category.translations,
          }),
        ),
    );

  const getBallot = vi
    .spyOn(AwardsService, "awardsBallotControllerGetBallotV1")
    .mockImplementation((async () => {
      if (ballotError) {
        throw ballotError;
      }
      return currentBallot;
    }) as never);

  const registerVote = vi
    .spyOn(AwardsService, "awardsVoteControllerRegisterVoteV1")
    .mockImplementation((async (body: {
      categoryId: number;
      gameId: number;
    }) => {
      const target = currentBallot.categories.find(
        (category) => category.id === body.categoryId,
      );

      if (target) {
        const isNewVote = target.voteGameId == null;
        currentBallot = {
          ...currentBallot,
          categoriesVoted:
            currentBallot.categoriesVoted + (isNewVote ? 1 : 0),
          categories: currentBallot.categories.map((category) =>
            category.id === body.categoryId
              ? { ...category, voteGameId: body.gameId }
              : category,
          ),
        };
      }
    }) as never);

  const findAllByIds = vi
    .spyOn(GameRepositoryService, "gameRepositoryControllerFindAllByIdsV1")
    .mockResolvedValue(games);

  return { getBallot, getCategories, registerVote, findAllByIds, event };
}

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

const BASE_CATEGORIES: BallotCategoryInput[] = [
  {
    id: 40,
    name: "Jogo do Ano",
    order: 0,
    voteGameId: 205,
    nominees: [
      { gameId: 101, status: "played", playtimeSeconds: 309600, rating: 4.5 },
      { gameId: 102, status: "planned" },
      { gameId: 205, status: "played", playtimeSeconds: 0, rating: null },
      { gameId: 206, status: "not_played" },
    ],
  },
  {
    id: 41,
    name: "Direção de Arte",
    order: 1,
    nominees: [
      { gameId: 110, status: "played", playtimeSeconds: 7200, rating: 4 },
      { gameId: 111, status: "not_played" },
    ],
  },
  {
    id: 99,
    name: "Seu GOTY pessoal",
    order: 2,
    isPersonalGOTY: true,
    suggestedGameId: 101,
    nominees: [],
  },
];

const BASE_GAMES = [
  buildGame(101, "Nioh 3"),
  buildGame(102, "Saros"),
  buildGame(110, "Pragmata"),
  buildGame(111, "Wolverine"),
  buildGame(205, "Resident Evil Requiem"),
  buildGame(206, "Phantom Blade Zero"),
];

describe("AwardsBallotScreen", () => {
  it("keeps the server order, numbers the categories and puts the voted game first", async () => {
    session.userId = "user-1";
    const { getBallot } = loadScreen({
      phase: "voting",
      categories: BASE_CATEGORIES,
      games: BASE_GAMES,
    });

    const { container } = renderScreen();

    await waitFor(() =>
      expect(screen.getByText("Sua cédula")).toBeTruthy(),
    );
    await waitFor(() => expect(screen.getByText("Nioh 3")).toBeTruthy());

    expect(getBallot).toHaveBeenCalledWith(12);
    expect(screen.getByText("1 de 3")).toBeTruthy();
    expect(
      container.querySelector("[data-awards-progress-bar]"),
    ).toBeTruthy();

    const rows = Array.from(
      container.querySelectorAll("[data-awards-category-row]"),
    );
    expect(rows).toHaveLength(3);
    expect(rows[0]?.textContent).toContain("01");
    expect(rows[0]?.textContent).toContain("Jogo do Ano");
    expect(rows[2]?.textContent).toContain("03");
    expect(rows[2]?.textContent).toContain("Seu GOTY pessoal");
    expect(rows[2]?.textContent).toContain("Sugerido: Nioh 3");

    expect(screen.getByText("Categoria 01 de 03")).toBeTruthy();

    // A common category with nominees offers only the nominees, no free search.
    expect(
      container.querySelector("[data-awards-eligible-game-search]"),
    ).toBeNull();

    const cards = Array.from(
      container.querySelectorAll("[data-awards-nominee-card]"),
    );
    expect(cards[0]?.getAttribute("data-game-id")).toBe("205");
    expect(cards[0]?.textContent).toContain("Seu voto");
  });

  it("shows hours, rating, played without hours and planned", async () => {
    session.userId = "user-1";
    loadScreen({
      phase: "voting",
      categories: [
        {
          id: 40,
          name: "Jogo do Ano",
          order: 0,
          nominees: [
            {
              gameId: 101,
              status: "played",
              playtimeSeconds: 309600,
              rating: 4.5,
            },
            {
              gameId: 102,
              status: "played",
              playtimeSeconds: 0,
              rating: null,
            },
            { gameId: 205, status: "planned" },
            { gameId: 206, status: "not_played" },
          ],
        },
      ],
      games: BASE_GAMES,
    });

    renderScreen();

    await waitFor(() =>
      expect(
        screen.getByText("Você jogou · 86 h · nota 9"),
      ).toBeTruthy(),
    );

    expect(screen.getByText("Você jogou")).toBeTruthy();
    expect(screen.getByText("Na sua lista de desejos")).toBeTruthy();
    expect(screen.getByText("Ainda não jogou")).toBeTruthy();
    await waitFor(() =>
      expect(screen.getAllByText("Koei Tecmo · PS5")).toHaveLength(4),
    );
    expect(screen.getByText("Todos · 4")).toBeTruthy();
    expect(screen.getByText("Que joguei · 2")).toBeTruthy();
  });

  it("filters the grid to the games the user played", async () => {
    session.userId = "user-1";
    loadScreen({
      phase: "voting",
      categories: [
        {
          id: 40,
          name: "Jogo do Ano",
          order: 0,
          nominees: [
            { gameId: 101, status: "played", playtimeSeconds: 7200 },
            { gameId: 102, status: "played", playtimeSeconds: 3600 },
            { gameId: 205, status: "planned" },
            { gameId: 206, status: "not_played" },
          ],
        },
      ],
      games: BASE_GAMES,
    });

    const { container } = renderScreen();

    await waitFor(() => expect(screen.getByText("Todos · 4")).toBeTruthy());

    fireEvent.click(screen.getByText("Que joguei · 2"));

    await waitFor(() => {
      const cardIds = Array.from(
        container.querySelectorAll("[data-awards-nominee-card]"),
      ).map((card) => card.getAttribute("data-game-id"));
      expect(cardIds).toEqual(["101", "102"]);
    });
  });

  it("offers free search on a legacy event whose categories have no nominees", async () => {
    session.userId = "user-1";
    const { registerVote } = loadScreen({
      phase: "voting",
      year: 2025,
      categories: [
        {
          id: 50,
          name: "Jogo do Ano",
          order: 0,
          nominees: [],
        },
      ],
      games: BASE_GAMES,
    });

    const { container } = renderScreen(
      <AwardsBallotScreen eventYear={2025} />,
    );

    await waitFor(() =>
      expect(
        container.querySelector("[data-awards-eligible-game-search]"),
      ).toBeTruthy(),
    );

    expect(
      container
        .querySelector("[data-awards-eligible-game-search]")
        ?.getAttribute("data-year"),
    ).toBe("2025");
    expect(
      container.querySelectorAll("[data-awards-nominee-card]"),
    ).toHaveLength(0);

    fireEvent.click(screen.getByText("select-205"));

    await waitFor(() =>
      expect(screen.getByText("Seu voto em Jogo do Ano")).toBeTruthy(),
    );

    fireEvent.click(screen.getByText("Confirmar voto"));

    await waitFor(() =>
      expect(registerVote).toHaveBeenCalledWith({
        categoryId: 50,
        gameId: 205,
      }),
    );

    await waitFor(() =>
      expect(screen.getByText("Sua cédula está completa!")).toBeTruthy(),
    );
    expect(screen.getByText("Compartilhar minha cédula")).toBeTruthy();
  });

  it("confirms a vote, advances to the next category and completes the ballot on the last one", async () => {
    session.userId = "user-1";
    const { registerVote } = loadScreen({
      phase: "voting",
      categories: [
        {
          id: 40,
          name: "Jogo do Ano",
          order: 0,
          nominees: [
            { gameId: 101, status: "played", playtimeSeconds: 7200 },
            { gameId: 102, status: "not_played" },
          ],
        },
        {
          id: 41,
          name: "Narrativa",
          order: 1,
          nominees: [
            { gameId: 110, status: "played", playtimeSeconds: 3600 },
            { gameId: 111, status: "planned" },
          ],
        },
      ],
      games: BASE_GAMES,
    });

    const { container } = renderScreen();

    await waitFor(() => expect(screen.getByText("Nioh 3")).toBeTruthy());

    fireEvent.click(
      container.querySelector(
        '[data-awards-nominee-card][data-game-id="101"]',
      )!,
    );

    await waitFor(() =>
      expect(screen.getByText("Seu voto em Jogo do Ano")).toBeTruthy(),
    );

    fireEvent.click(
      screen.getByText("Confirmar e ir para Narrativa"),
    );

    await waitFor(() =>
      expect(registerVote).toHaveBeenCalledWith({
        categoryId: 40,
        gameId: 101,
      }),
    );

    await waitFor(() =>
      expect(screen.getByText("Categoria 02 de 02")).toBeTruthy(),
    );

    fireEvent.click(
      container.querySelector(
        '[data-awards-nominee-card][data-game-id="110"]',
      )!,
    );

    await waitFor(() =>
      expect(screen.getByText("Seu voto em Narrativa")).toBeTruthy(),
    );

    fireEvent.click(screen.getByText("Confirmar voto"));

    await waitFor(() =>
      expect(registerVote).toHaveBeenCalledWith({
        categoryId: 41,
        gameId: 110,
      }),
    );

    await waitFor(() =>
      expect(screen.getByText("Sua cédula está completa!")).toBeTruthy(),
    );
  });

  it("skips a category without sending a vote", async () => {
    session.userId = "user-1";
    const { registerVote } = loadScreen({
      phase: "voting",
      categories: [
        {
          id: 40,
          name: "Jogo do Ano",
          order: 0,
          nominees: [{ gameId: 101, status: "played" }],
        },
        {
          id: 41,
          name: "Narrativa",
          order: 1,
          nominees: [{ gameId: 110, status: "played" }],
        },
      ],
      games: BASE_GAMES,
    });

    const { container } = renderScreen();

    await waitFor(() => expect(screen.getByText("Nioh 3")).toBeTruthy());

    fireEvent.click(
      container.querySelector(
        '[data-awards-nominee-card][data-game-id="101"]',
      )!,
    );

    await waitFor(() =>
      expect(screen.getByText("Pular por agora")).toBeTruthy(),
    );

    fireEvent.click(screen.getByText("Pular por agora"));

    await waitFor(() =>
      expect(screen.getByText("Categoria 02 de 02")).toBeTruthy(),
    );

    expect(registerVote).not.toHaveBeenCalled();
    expect(
      container.querySelector(
        '[data-awards-category-row][data-state="voted"]',
      ),
    ).toBeNull();
  });

  it("is read-only outside the voting phase", async () => {
    session.userId = "user-1";
    loadScreen({
      phase: "voting_closed",
      categories: BASE_CATEGORIES,
      games: BASE_GAMES,
    });

    const { container } = renderScreen();

    await waitFor(() =>
      expect(
        screen.getByText(
          "A votação está encerrada. Estes são os seus votos.",
        ),
      ).toBeTruthy(),
    );

    expect(screen.queryByText("Pular por agora")).toBeNull();
    expect(
      container.querySelectorAll('[data-awards-nominee-card][role="button"]'),
    ).toHaveLength(0);
    expect(screen.getAllByText("Seu voto").length).toBeGreaterThan(0);
    expect(container.querySelector("[data-awards-vote-bar]")).toBeNull();
  });

  it("does not treat a 401 as an empty ballot", async () => {
    session.userId = "user-1";
    const { getBallot } = loadScreen({
      phase: "voting",
      categories: BASE_CATEGORIES,
      games: BASE_GAMES,
      ballotError: apiError(401),
    });

    const { container } = renderScreen();

    await waitFor(() =>
      expect(screen.getByText("Entre para votar")).toBeTruthy(),
    );

    expect(getBallot).toHaveBeenCalledWith(12);
    expect(screen.queryByText("Sua cédula")).toBeNull();
    expect(screen.queryByText("0 de 3")).toBeNull();
    expect(
      container.querySelector("[data-awards-category-list]"),
    ).toBeNull();
  });

  it("shows the sign-in invite to a visitor without reading the ballot", async () => {
    const { getBallot } = loadScreen({
      phase: "voting",
      categories: BASE_CATEGORIES,
      games: BASE_GAMES,
    });

    const { container } = renderScreen();

    await waitFor(() =>
      expect(screen.getByText("Entre para votar")).toBeTruthy(),
    );

    expect(getBallot).not.toHaveBeenCalled();
    expect(screen.queryByText("Sua cédula")).toBeNull();
    expect(
      container.querySelector("[data-awards-category-list]"),
    ).toBeNull();
  });

  it("offers the suggestion and the eligible search on the personal GOTY", async () => {
    session.userId = "user-1";
    loadScreen({
      phase: "voting",
      categories: [
        {
          id: 40,
          name: "Jogo do Ano",
          order: 0,
          nominees: [
            { gameId: 101, status: "played", playtimeSeconds: 7200 },
            { gameId: 102, status: "not_played" },
          ],
        },
        {
          id: 99,
          name: "Seu GOTY pessoal",
          order: 1,
          isPersonalGOTY: true,
          suggestedGameId: 101,
          nominees: [],
        },
      ],
      games: BASE_GAMES,
    });

    const { container } = renderScreen();

    await waitFor(() => expect(screen.getByText("Nioh 3")).toBeTruthy());

    const rows = Array.from(
      container.querySelectorAll("[data-awards-category-row]"),
    );
    fireEvent.click(rows[1]!);

    await waitFor(() =>
      expect(screen.getByText("Categoria 02 de 02")).toBeTruthy(),
    );

    const panel = container.querySelector("[data-awards-category-panel]")!;
    expect(
      panel.querySelector("[data-awards-eligible-game-search]"),
    ).toBeTruthy();
    expect(
      panel.querySelector("[data-awards-ballot-suggestion]"),
    ).toBeTruthy();

    // The suggestion card is the only card: no six-nominee grid.
    expect(panel.querySelectorAll("[data-awards-nominee-card]")).toHaveLength(
      1,
    );

    fireEvent.click(
      panel.querySelector('[data-awards-nominee-card][data-game-id="101"]')!,
    );

    await waitFor(() =>
      expect(screen.getByText("Seu voto em Seu GOTY pessoal")).toBeTruthy(),
    );
  });

  it("shows the personal GOTY vote and the eligible search while voting", async () => {
    session.userId = "user-1";
    const { registerVote } = loadScreen({
      phase: "voting",
      categories: [
        {
          id: 99,
          name: "Seu GOTY pessoal",
          order: 0,
          isPersonalGOTY: true,
          voteGameId: 205,
          nominees: [],
        },
        {
          id: 40,
          name: "Jogo do Ano",
          order: 1,
          nominees: [{ gameId: 101, status: "played" }],
        },
      ],
      games: BASE_GAMES,
    });

    const { container } = renderScreen();

    await waitFor(() =>
      expect(screen.getByText("Categoria 01 de 02")).toBeTruthy(),
    );

    const panel = container.querySelector("[data-awards-category-panel]")!;
    const cards = Array.from(
      panel.querySelectorAll("[data-awards-nominee-card]"),
    );

    // The existing pick is visible even though the category has no nominees.
    expect(cards).toHaveLength(1);
    expect(cards[0]?.getAttribute("data-game-id")).toBe("205");
    expect(cards[0]?.getAttribute("data-selected")).toBe("true");
    expect(cards[0]?.textContent).toContain("Seu voto");
    expect(panel.querySelector("[data-awards-ballot-suggestion]")).toBeNull();

    // The search is still offered so the pick can be changed.
    const search = panel.querySelector("[data-awards-eligible-game-search]");
    expect(search).toBeTruthy();
    expect(search?.getAttribute("data-selected")).toBe("205");

    fireEvent.click(screen.getByText("select-206"));

    await waitFor(() =>
      expect(screen.getByText("Seu voto em Seu GOTY pessoal")).toBeTruthy(),
    );

    fireEvent.click(screen.getByText("Confirmar e ir para Jogo do Ano"));

    await waitFor(() =>
      expect(registerVote).toHaveBeenCalledWith({
        categoryId: 99,
        gameId: 206,
      }),
    );
  });

  it("shows the personal GOTY vote without actions outside the voting phase", async () => {
    session.userId = "user-1";
    loadScreen({
      phase: "voting_closed",
      categories: [
        {
          id: 99,
          name: "Seu GOTY pessoal",
          order: 0,
          isPersonalGOTY: true,
          voteGameId: 205,
          suggestedGameId: 101,
          nominees: [],
        },
      ],
      games: BASE_GAMES,
    });

    const { container } = renderScreen();

    await waitFor(() =>
      expect(
        screen.getByText("A votação está encerrada. Estes são os seus votos."),
      ).toBeTruthy(),
    );
    await waitFor(() =>
      expect(screen.getByText("Categoria 01 de 01")).toBeTruthy(),
    );

    const panel = container.querySelector("[data-awards-category-panel]")!;
    const cards = Array.from(
      panel.querySelectorAll("[data-awards-nominee-card]"),
    );

    expect(cards).toHaveLength(1);
    expect(cards[0]?.getAttribute("data-game-id")).toBe("205");
    expect(cards[0]?.getAttribute("data-selected")).toBe("true");
    expect(cards[0]?.textContent).toContain("Seu voto");
    expect(cards[0]?.getAttribute("role")).toBeNull();
    // The vote wins over the suggestion, and nothing can change it.
    expect(panel.querySelector("[data-awards-ballot-suggestion]")).toBeNull();
    expect(
      panel.querySelector("[data-awards-eligible-game-search]"),
    ).toBeNull();
    expect(
      screen.queryByText("Você ainda não votou nesta categoria."),
    ).toBeNull();
    expect(screen.queryByText("Pular por agora")).toBeNull();
    expect(container.querySelector("[data-awards-vote-bar]")).toBeNull();
  });

  it("shares the public ballot link from the completed ballot", async () => {
    session.userId = "user-1";
    loadScreen({
      phase: "voting",
      categories: [
        {
          id: 40,
          name: "Jogo do Ano",
          order: 0,
          voteGameId: 101,
          nominees: [{ gameId: 101, status: "played" }],
        },
      ],
      games: BASE_GAMES,
    });

    renderScreen();

    await waitFor(() =>
      expect(screen.getByText("Sua cédula está completa!")).toBeTruthy(),
    );

    fireEvent.click(screen.getByText("Compartilhar minha cédula"));

    await waitFor(() => expect(shareText).toHaveBeenCalledTimes(1));
    expect(shareText.mock.calls[0][0]).toContain(
      "/awards/2026/nominees/user-1",
    );
  });

  it("shows the en category text in the list, the panel and the vote bar", async () => {
    session.userId = "user-1";
    loadScreen({
      phase: "voting",
      categories: [
        {
          id: 40,
          name: "Jogo do Ano",
          order: 0,
          translations: [
            categoryTranslation(EN, "Game of the Year", "The main award."),
          ],
          nominees: [
            { gameId: 101, status: "played", playtimeSeconds: 7200 },
            { gameId: 102, status: "not_played" },
          ],
        },
        {
          id: 41,
          name: "Direção de Arte",
          order: 1,
          translations: [
            categoryTranslation(EN, "Art Direction", "Visual style."),
          ],
          nominees: [{ gameId: 110, status: "played" }],
        },
      ],
      games: BASE_GAMES,
    });

    const { container } = renderScreen(undefined, { language: "en" });

    await waitFor(() => expect(screen.getByText("Nioh 3")).toBeTruthy());

    const rows = Array.from(
      container.querySelectorAll("[data-awards-category-row]"),
    );
    expect(rows[0]?.textContent).toContain("Game of the Year");
    expect(rows[0]?.textContent).not.toContain("Jogo do Ano");

    const panel = container.querySelector("[data-awards-category-panel]")!;
    expect(panel.textContent).toContain("Game of the Year");
    expect(panel.textContent).toContain("The main award.");

    fireEvent.click(
      container.querySelector(
        '[data-awards-nominee-card][data-game-id="101"]',
      )!,
    );

    await waitFor(() =>
      expect(screen.getByText("Your vote in Game of the Year")).toBeTruthy(),
    );
    expect(screen.getByText("Confirm and go to Art Direction")).toBeTruthy();
  });

  it("keeps the base category text when the en entry is missing", async () => {
    session.userId = "user-1";
    loadScreen({
      phase: "voting",
      categories: [
        {
          id: 40,
          name: "Jogo do Ano",
          order: 0,
          translations: [
            categoryTranslation(
              PT_BR,
              "Jogo do Ano (PT)",
              "O prêmio principal.",
            ),
          ],
          nominees: [{ gameId: 101, status: "played" }],
        },
      ],
      games: BASE_GAMES,
    });

    const { container } = renderScreen(undefined, { language: "en" });

    await waitFor(() => expect(screen.getByText("Nioh 3")).toBeTruthy());

    const rows = Array.from(
      container.querySelectorAll("[data-awards-category-row]"),
    );
    expect(rows[0]?.textContent).toContain("Jogo do Ano");
    expect(rows[0]?.textContent).not.toContain("Jogo do Ano (PT)");

    const panel = container.querySelector("[data-awards-category-panel]")!;
    expect(panel.textContent).toContain("Jogo do Ano description");
    expect(panel.textContent).not.toContain("O prêmio principal.");
  });

  it("falls back to the joined category translations when the ballot has none", async () => {
    session.userId = "user-1";
    loadScreen({
      phase: "voting",
      categories: [
        {
          id: 40,
          name: "Jogo do Ano",
          order: 0,
          nominees: [{ gameId: 101, status: "played" }],
        },
      ],
      readCategories: [
        buildCategory({
          id: 40,
          name: "Jogo do Ano",
          order: 0,
          translations: [
            categoryTranslation(EN, "Game of the Year", "The main award."),
          ],
        }),
      ],
      games: BASE_GAMES,
    });

    const { container } = renderScreen(undefined, { language: "en" });

    await waitFor(() => expect(screen.getByText("Nioh 3")).toBeTruthy());

    const panel = container.querySelector("[data-awards-category-panel]")!;
    expect(panel.textContent).toContain("Game of the Year");
    expect(panel.textContent).toContain("The main award.");
  });

  it("updates the category text on a language switch without refetching", async () => {
    session.userId = "user-1";
    const { getBallot, getCategories } = loadScreen({
      phase: "voting",
      categories: [
        {
          id: 40,
          name: "Jogo do Ano",
          order: 0,
          translations: [
            categoryTranslation(EN, "Game of the Year", "The main award."),
            categoryTranslation(
              PT_BR,
              "Jogo do Ano (PT)",
              "O prêmio principal.",
            ),
          ],
          nominees: [{ gameId: 101, status: "played" }],
        },
      ],
      games: BASE_GAMES,
    });

    const { container } = renderScreen(undefined, {
      language: "pt-BR",
      controls: <LanguageSwitcher language={"en"} />,
    });

    await waitFor(() => expect(screen.getByText("Nioh 3")).toBeTruthy());

    let panel = container.querySelector("[data-awards-category-panel]")!;
    expect(panel.textContent).toContain("Jogo do Ano (PT)");
    expect(panel.textContent).toContain("O prêmio principal.");
    expect(getBallot).toHaveBeenCalledTimes(1);
    expect(getCategories).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText("switch-to-en"));

    await waitFor(() => {
      panel = container.querySelector("[data-awards-category-panel]")!;
      expect(panel.textContent).toContain("Game of the Year");
      expect(panel.textContent).toContain("The main award.");
    });

    expect(getBallot).toHaveBeenCalledTimes(1);
    expect(getCategories).toHaveBeenCalledTimes(1);
  });
});
