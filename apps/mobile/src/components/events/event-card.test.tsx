// @vitest-environment jsdom
import React from "react";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  AwardsService,
  RecapService,
  StatisticsService,
  type AwardsBallotDto,
  type AwardsCategoryResult,
  type RecapCurrentDto,
  type RecapStatusDto,
  type VotableAwardsCategoryDto,
  type YearRecapDto,
} from "@repo/wrapper/server";
import {
  EventCard,
  type EventCardKind,
} from "../../../../../packages/ui/src/components/events/view/EventCard";
import type { SeasonEvents } from "../../../../../packages/ui/src/components/events/hooks/useSeasonEvents";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";
import ptBR from "../../../../../packages/locales/src/translations/json/pt-BR.json";

const seasonState = vi.hoisted(() => ({
  value: null as unknown as SeasonEvents,
}));

vi.mock(
  "../../../../../packages/ui/src/components/events/hooks/useSeasonEvents",
  () => ({ useSeasonEvents: () => seasonState.value }),
);

// The nominations art reads the signed-in user's nominations.
vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => seasonState.value?.userId }),
);

// The cards hydrate game covers/names; the repository read is out of scope here
// and its auth-aware cover opt-in needs a session client.
vi.mock(
  "../../../../../packages/ui/src/components/game/hooks/useGames",
  () => ({
    useGames: (dto: { gameIds?: number[] }) => ({
      data: (dto.gameIds ?? []).map((id: number) => ({
        id,
        name: `Game ${id}`,
      })),
      queryKey: ["game", "all", dto.gameIds],
      invalidate: () => {},
    }),
  }),
);

function lookup(path: string): unknown {
  let value: unknown = ptBR;
  for (const part of path.split(".")) {
    value =
      typeof value === "object" && value !== null
        ? (value as Record<string, unknown>)[part]
        : undefined;
  }
  return value;
}

function translate(key: string, options?: Record<string, unknown>): string {
  const value = lookup(key);
  if (typeof value !== "string") return key;

  return value.replace(/\{\{(\w+)\}\}/g, (_, name) =>
    String(options?.[name] ?? ""),
  );
}

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({
    t: translate,
    i18n: { language: "pt-BR", resolvedLanguage: "pt-BR" },
  }),
  useI18nContext: () => ({
    language: "pt-BR",
    resolvedLanguage: "pt-BR",
    setLanguage: () => {},
    supportedLanguages: ["en", "pt-BR"],
  }),
}));

const pushSpy = vi.fn(async () => {});

function createClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

function renderCard(
  kind: EventCardKind,
  layout: "wide" | "half" | "mobile" = "wide",
) {
  return render(<EventCard kind={kind} layout={layout} />, {
    wrapper: ({ children }) => (
      <MantineProvider>
        <QueryClientProvider client={createClient()}>
          <UIProvider
            presenters={{
              Link: ({
                href,
                children,
              }: {
                href: string;
                children?: React.ReactNode;
              }) => <a href={href}>{children}</a>,
            }}
            hooks={{
              useRouter: () => ({
                pathname: "/home",
                asPath: "/home",
                back: () => {},
                push: pushSpy,
                query: new URLSearchParams(),
              }),
            }}
          >
            {children}
          </UIProvider>
        </QueryClientProvider>
      </MantineProvider>
    ),
  });
}

function awardsEvent(phase: string): SeasonEvents["awardsEvent"] {
  return {
    id: 12,
    year: 2026,
    phase,
    categoriesCount: 12,
    createdAt: "2026-10-01T12:00:00.000Z",
    updatedAt: "2026-11-15T12:00:00.000Z",
    deletedAt: null,
    votingStartDate: "2026-12-01T00:00:00.000Z",
    votingEndDate: new Date(Date.now() + 4.2 * 86_400_000).toISOString(),
    resultsDate: new Date(Date.now() - 86_400_000).toISOString(),
    nominationStartDate: "2026-11-20T00:00:00.000Z",
    nominationEndDate: new Date(Date.now() + 12 * 3_600_000).toISOString(),
    eligibilityCutoffDate: "2026-11-30T00:00:00.000Z",
  } as unknown as SeasonEvents["awardsEvent"];
}

function gotyCategory(): VotableAwardsCategoryDto {
  return {
    id: 99,
    eventId: 12,
    name: "Jogo do Ano",
    description: "",
    order: 1,
    isGOTY: true,
    isPersonalGOTY: false,
    nomineeCount: 6,
    nomineesFinalizedAt: null,
    suggestions: [],
    isVotable: true,
    votingStartDate: "2026-12-01T00:00:00.000Z",
    votingEndDate: "2026-12-20T23:59:59.000Z",
    createdAt: "2026-10-01T12:00:00.000Z",
    updatedAt: "2026-11-15T12:00:00.000Z",
    deletedAt: null,
  } as unknown as VotableAwardsCategoryDto;
}

function ballot(categoriesVoted: number): AwardsBallotDto {
  return {
    eventId: 12,
    year: 2026,
    phase: "voting",
    categoriesVoted,
    categoriesTotal: 12,
    categories: [
      {
        id: 99,
        name: "Jogo do Ano",
        description: "",
        order: 1,
        isPersonalGOTY: false,
        voteGameId: null,
        playedNomineesCount: 4,
        suggestedGameId: null,
        nominees: Array.from({ length: 6 }, (_, index) => ({
          gameId: 100 + index,
          status: "played",
          playtimeSeconds: 3600,
          rating: null,
        })),
      },
    ],
  } as unknown as AwardsBallotDto;
}

function gotyResult(): AwardsCategoryResult {
  return {
    id: 1,
    categoryId: 99,
    totalVotesCount: 4812,
    totalUniqueGamesSubmitted: 3,
    totalUsersParticipating: 1000,
    totalPlayedVotesCount: 2391,
    category: {
      id: 99,
      name: "Jogo do Ano",
      description: "",
      order: 1,
      isGOTY: true,
      isPersonalGOTY: false,
    },
    winners: [
      {
        id: 1,
        resultId: 1,
        gameId: 501,
        game: { id: 501, name: "Resident Evil Requiem" },
        position: 1,
        totalVotes: 1500,
        votesPercentage: 0.31,
        playedVotes: 700,
        playedVotesPercentage: 0.29,
      },
    ],
  } as unknown as AwardsCategoryResult;
}

function recapFixture(calendar: boolean): YearRecapDto {
  return {
    id: 1,
    year: 2026,
    profileUserId: "user-1",
    totalPlaytimeSeconds: 412 * 3600,
    totalPlayedGames: 38,
    totalFinishedGames: 14,
    totalAddedGames: 52,
    totalDroppedGames: 6,
    backlogGrowth: 32,
    isFinal: false,
    topGames: Array.from({ length: 38 }, (_, index) => ({
      gameId: 500 + index,
      platformIds: [1],
      totalPlaytimeSeconds: 86 * 3600,
      share: index === 0 ? 0.21 : 0.01,
      firstPlayedAt: null,
      finishedAt: null,
      rating: null,
    })),
    calendar: calendar
      ? { monthlyPlaytimeSeconds: [12, 10, 71, 30, 0, 4, 8, 9, 3, 20, 11, 5] }
      : null,
    communityHighlights: null,
    playedGames: [],
    playedGamesByPlatform: [],
    distributionByGenre: [],
    distributionByMode: [],
    distributionByTheme: [],
    distributionByPlatform: [],
    playtimeByPlatform: [],
    dailyPlaytimeSeconds: null,
    totalReviewsCreated: 0,
    totalCollectionsCreated: 0,
    totalFollowersGained: 0,
    totalLikesPerformed: 0,
    likesHistoryComplete: false,
    likesCompleteSince: null,
    genres: [],
    themes: [],
    modes: [],
    platforms: [],
    createdAt: "2026-11-15T00:00:00.000Z",
    updatedAt: "2026-11-15T00:00:00.000Z",
    deletedAt: null,
  } as unknown as YearRecapDto;
}

function liveRecapWindow(): RecapCurrentDto {
  return {
    year: 2026,
    phase: "live",
    opensAt: "2026-11-15T00:00:00.000Z",
    closesAt: "2026-12-31T23:59:59.999Z",
  } as unknown as RecapCurrentDto;
}

function createdStatus(): RecapStatusDto {
  return {
    isRecapCreated: true,
    isRecapEligible: true,
    phase: "live",
  } as unknown as RecapStatusDto;
}

function season(overrides: Partial<SeasonEvents> = {}): SeasonEvents {
  return {
    userId: "user-1",
    awardsEvent: null,
    awardsEntry: null,
    awardsBallot: undefined,
    awardsCategories: undefined,
    recapWindow: undefined,
    recapStatus: null,
    recapEntry: null,
    recapYear: null,
    recapHref: null,
    isLoading: false,
    ...overrides,
  };
}

function buttonHref(label: string): string | null {
  return (
    screen
      .getByRole("button", { name: label })
      .closest("a")
      ?.getAttribute("href") ?? null
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.spyOn(RecapService, "recapControllerGetCurrentRecapV1").mockResolvedValue(
    liveRecapWindow(),
  );
  vi.spyOn(RecapService, "recapControllerGetRecapStatusV1").mockResolvedValue(
    createdStatus(),
  );
  vi.spyOn(RecapService, "recapControllerGetRecapByYearV1").mockResolvedValue(
    recapFixture(true),
  );
  vi.spyOn(
    AwardsService,
    "awardsControllerGetResultsByEventIdV1",
  ).mockResolvedValue([gotyResult()]);
  vi.spyOn(
    AwardsService,
    "awardsNominationControllerGetMyNominationsV1",
  ).mockResolvedValue([]);
  vi.spyOn(
    StatisticsService,
    "statisticsControllerFindRankingsV1",
  ).mockResolvedValue({
    items: [],
    pagination: { limit: 2, offset: 0, total: 0, hasNextPage: false },
  } as never);
  vi.spyOn(AwardsService, "awardsControllerGetScoreboardV1").mockResolvedValue({
    totals: { hits: 7, voted: 10, scorable: 11 },
    categories: [],
    personalGOTY: null,
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("EventCard · Awards Indicações", () => {
  it("renders the nominations copy, timeline and authenticated actions", async () => {
    seasonState.value = season({
      awardsEvent: awardsEvent("nominations"),
      awardsEntry: {
        kind: "nominations",
        showHomeCard: true,
        dockBadge: "live",
        href: "/awards/2026/nominations",
      },
    });

    renderCard("awards-nominations");

    await waitFor(() => expect(screen.getByText("Awards 2026")).toBeTruthy());

    expect(screen.getByText("Quais foram os jogos do ano?")).toBeTruthy();
    expect(
      screen.getByText(
        "Indique até 3 jogos por categoria. Os mais indicados vão para a cédula de 1 de dezembro.",
      ),
    ).toBeTruthy();
    expect(screen.getByText("+1000 XP e medalha por participar")).toBeTruthy();
    expect(screen.getByText("Fecha amanhã")).toBeTruthy();
    expect(screen.getByTestId("event-phase-timeline")).toBeTruthy();
    expect(screen.getByText("Indicações")).toBeTruthy();
    expect(screen.getByText("Votação")).toBeTruthy();
    expect(screen.getByText("Resultado")).toBeTruthy();
    expect(screen.getByText("Sua indicação")).toBeTruthy();
    expect(buttonHref("Indicar jogos")).toBe("/awards/2026/nominations");
    expect(buttonHref("Ver categorias")).toBe("/awards/2026/nominations");
  });

  it("shows the Half art column and drops the reward line", async () => {
    seasonState.value = season({
      awardsEvent: awardsEvent("nominations"),
      awardsEntry: {
        kind: "nominations",
        showHomeCard: true,
        dockBadge: "live",
        href: "/awards/2026/nominations",
      },
    });

    renderCard("awards-nominations", "half");

    await waitFor(() => expect(screen.getByText("Awards 2026")).toBeTruthy());

    expect(screen.getByTestId("event-card-art")).toBeTruthy();
    expect(screen.getByText("Sua indicação")).toBeTruthy();
    expect(screen.queryByText("+1000 XP e medalha por participar")).toBeNull();
    expect(buttonHref("Indicar jogos")).toBe("/awards/2026/nominations");
  });

  it("shows the nominations art in the mobile card", async () => {
    seasonState.value = season({
      awardsEvent: awardsEvent("nominations"),
      awardsEntry: {
        kind: "nominations",
        showHomeCard: true,
        dockBadge: "live",
        href: "/awards/2026/nominations",
      },
    });

    renderCard("awards-nominations", "mobile");

    await waitFor(() => expect(screen.getByText("Awards 2026")).toBeTruthy());

    expect(screen.getByText("Sua indicação")).toBeTruthy();
    expect(buttonHref("Indicar jogos")).toBe("/awards/2026/nominations");
  });

  it("shows only the sign-in action to a visitor", async () => {
    seasonState.value = season({
      userId: undefined,
      awardsEvent: awardsEvent("nominations"),
      awardsEntry: {
        kind: "nominations",
        showHomeCard: true,
        dockBadge: "live",
        href: "/awards/2026/nominations",
      },
    });

    renderCard("awards-nominations");

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Entrar para indicar" }),
      ).toBeTruthy(),
    );

    expect(screen.queryByRole("button", { name: "Indicar jogos" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Ver categorias" })).toBeNull();
  });
});

describe("EventCard · Awards Votação", () => {
  it("renders the ballot progress, the GOTY played count and the voting actions", async () => {
    const event = awardsEvent("voting");
    seasonState.value = season({
      awardsEvent: event,
      awardsEntry: {
        kind: "voting",
        showHomeCard: true,
        dockBadge: "live",
        href: "/awards/2026/vote",
      },
      awardsBallot: ballot(7) as unknown as SeasonEvents["awardsBallot"],
      awardsCategories: [gotyCategory()],
    });

    renderCard("awards-voting");

    await waitFor(() =>
      expect(
        screen.getByText("Faltam 5 categorias na sua cédula"),
      ).toBeTruthy(),
    );

    expect(
      screen.getByText("Você jogou 4 dos 6 indicados a Jogo do Ano"),
    ).toBeTruthy();
    expect(screen.getByText("Sua cédula 7 de 12 categorias")).toBeTruthy();
    expect(screen.getByText("Fecha em 5 dias")).toBeTruthy();
    expect(buttonHref("Continuar votando")).toBe("/awards/2026/vote");
    expect(buttonHref("Ver cédula")).toBe("/awards/2026/vote");
  });

  it("keeps the visitor card free of ballot progress and authenticated actions", async () => {
    seasonState.value = season({
      userId: undefined,
      awardsEvent: awardsEvent("voting"),
      awardsEntry: {
        kind: "voting",
        showHomeCard: true,
        dockBadge: "live",
        href: "/awards/2026/vote",
      },
    });
    const getBallot = vi.spyOn(
      AwardsService,
      "awardsBallotControllerGetBallotV1",
    );

    renderCard("awards-voting");

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Entrar para votar" }),
      ).toBeTruthy(),
    );

    expect(getBallot).not.toHaveBeenCalled();
    expect(screen.queryByText(/Faltam/)).toBeNull();
    expect(screen.queryByText(/Sua cédula/)).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Continuar votando" }),
    ).toBeNull();
  });
});

describe("EventCard · Awards Resultado", () => {
  it("renders the GOTY winner, the votes and the score", async () => {
    seasonState.value = season({
      awardsEvent: awardsEvent("results"),
      awardsEntry: {
        kind: "results",
        showHomeCard: true,
        dockBadge: "new",
        href: "/awards/2026/result",
      },
    });

    renderCard("awards-results");

    await waitFor(() =>
      expect(
        screen.getByText("Resident Evil Requiem é o Jogo do Ano"),
      ).toBeTruthy(),
    );

    expect(screen.getByText("4.812 votos em 12 categorias.")).toBeTruthy();
    expect(screen.getByText("Você acertou 7 de 11")).toBeTruthy();
    expect(buttonHref("Ver vencedores")).toBe("/awards/2026/result");
    expect(buttonHref("Compartilhar placar")).toBe("/awards/2026/result");
  });

  it("does not read the scoreboard for a visitor", async () => {
    seasonState.value = season({
      userId: undefined,
      awardsEvent: awardsEvent("results"),
      awardsEntry: {
        kind: "results",
        showHomeCard: true,
        dockBadge: "new",
        href: "/awards/2026/result",
      },
    });
    const getScoreboard = vi.spyOn(
      AwardsService,
      "awardsControllerGetScoreboardV1",
    );

    renderCard("awards-results");

    await waitFor(() =>
      expect(
        screen.getByText("Resident Evil Requiem é o Jogo do Ano"),
      ).toBeTruthy(),
    );

    expect(getScoreboard).not.toHaveBeenCalled();
    expect(screen.queryByText(/Você acertou/)).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Compartilhar placar" }),
    ).toBeNull();
    expect(screen.getByRole("button", { name: "Ver vencedores" })).toBeTruthy();
  });
});

describe("EventCard · Retrospectiva Atualizando", () => {
  it("fills the mobile cover strip when only two games are available", async () => {
    const recap = recapFixture(true);
    vi.spyOn(RecapService, "recapControllerGetRecapByYearV1").mockResolvedValue(
      {
        ...recap,
        topGames: recap.topGames.slice(0, 2),
      },
    );
    seasonState.value = season({
      recapEntry: { kind: "live", year: 2026 },
      recapYear: 2026,
      recapHref: "/recap/2026/user-1",
    });

    renderCard("recap-live", "mobile");

    const covers = await screen.findByTestId("event-card-covers");
    expect(covers.children).toHaveLength(2);
    expect(covers.style.gridTemplateColumns).toBe("repeat(2, minmax(0, 1fr))");
  });

  it("renders hours, games, monthly bars and the top game sentence", async () => {
    seasonState.value = season({
      recapEntry: { kind: "live", year: 2026 },
      recapYear: 2026,
      recapHref: "/recap/2026/user-1",
      recapStatus: createdStatus() as unknown as SeasonEvents["recapStatus"],
    });

    renderCard("recap-live");

    await waitFor(() => expect(screen.getByText("412 h")).toBeTruthy());

    expect(screen.getByText("em 38 jogos · até hoje")).toBeTruthy();
    expect(screen.getByTestId("recap-monthly-bars")).toBeTruthy();
    expect(screen.getByText("Seu 2026 até agora")).toBeTruthy();
    expect(
      screen.getByText(
        "Game 500 ficou com 21% do seu ano. Ainda dá tempo de mudar o final: o ano fecha em 31 de dezembro.",
      ),
    ).toBeTruthy();
    expect(buttonHref("Ver minha retrospectiva")).toBe("/recap/2026/user-1");
    expect(buttonHref("Compartilhar")).toBe("/recap/2026/user-1/stories");
  });

  it("keeps the Half card to the single primary action", async () => {
    seasonState.value = season({
      recapEntry: { kind: "live", year: 2026 },
      recapYear: 2026,
      recapHref: "/recap/2026/user-1",
      recapStatus: createdStatus() as unknown as SeasonEvents["recapStatus"],
    });

    renderCard("recap-live", "half");

    await waitFor(() => expect(screen.getByText("412 h")).toBeTruthy());

    expect(screen.getByTestId("event-card-art")).toBeTruthy();
    expect(screen.getByTestId("recap-live-art")).toBeTruthy();
    expect(buttonHref("Ver minha retrospectiva")).toBe("/recap/2026/user-1");
    expect(screen.queryByRole("button", { name: "Compartilhar" })).toBeNull();
  });

  it("omits the monthly bars for a Recap without a calendar", async () => {
    vi.spyOn(RecapService, "recapControllerGetRecapByYearV1").mockResolvedValue(
      recapFixture(false),
    );
    seasonState.value = season({
      recapEntry: { kind: "live", year: 2026 },
      recapYear: 2026,
      recapHref: "/recap/2026/user-1",
      recapStatus: createdStatus() as unknown as SeasonEvents["recapStatus"],
    });

    renderCard("recap-live");

    await waitFor(() => expect(screen.getByText("412 h")).toBeTruthy());

    expect(screen.queryByTestId("recap-monthly-bars")).toBeNull();
    expect(screen.getByText("em 38 jogos · até hoje")).toBeTruthy();
  });

  it("shows the teaser to a visitor without reading the Recap", async () => {
    seasonState.value = season({
      userId: undefined,
      recapEntry: { kind: "live", year: 2026 },
      recapYear: 2026,
      recapHref: null,
    });
    const getRecap = vi.spyOn(RecapService, "recapControllerGetRecapByYearV1");

    renderCard("recap-live");

    await waitFor(() =>
      expect(screen.getByText("Crie sua conta e veja seu ano")).toBeTruthy(),
    );

    expect(getRecap).not.toHaveBeenCalled();
    expect(screen.queryByText("412 h")).toBeNull();
    expect(screen.getByRole("button", { name: "Criar conta" })).toBeTruthy();
  });
});

describe("EventCard · Retrospectiva Fechada", () => {
  it("renders the closing copy and the stories actions", async () => {
    seasonState.value = season({
      recapEntry: { kind: "closed", year: 2026 },
      recapYear: 2026,
      recapHref: "/recap/2026/user-1",
      recapStatus: createdStatus() as unknown as SeasonEvents["recapStatus"],
    });

    renderCard("recap-closed");

    await waitFor(() =>
      expect(
        screen.getByText("Seu 2026 fechou. Bora compartilhar?"),
      ).toBeTruthy(),
    );

    await waitFor(() =>
      expect(
        screen.getByText(
          "412 horas, 38 jogos e 14 zerados, em 5 stories prontas para postar.",
        ),
      ).toBeTruthy(),
    );
    expect(buttonHref("Ver stories")).toBe("/recap/2026/user-1/stories");
    expect(buttonHref("Baixar card")).toBe(
      "/recap/2026/user-1/stories?story=5",
    );
  });
});
