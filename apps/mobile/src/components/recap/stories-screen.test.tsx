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
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AwardsBallot } from "../../../../../packages/ui/src/components/awards/types";
import type { YearRecap } from "../../../../../packages/ui/src/components/recap/types";
import {
  getAvailableRecapStoryIds,
  getRecapGotyProgress,
  getRecapMonthGrid,
  resolveRecapStoryIndex,
} from "../../../../../packages/ui/src/components/recap/stories/recapStories";
import { RecapStoriesScreen } from "../../../../../packages/ui/src/components/recap/stories/RecapStoriesScreen";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";
import ptBR from "../../../../../packages/locales/src/translations/json/pt-BR.json";
import type {
  CurrentAwardsEventDto,
  VotableAwardsCategoryDto,
} from "@repo/wrapper/server";

const mocks = vi.hoisted(() => ({
  sessionUserId: undefined as string | undefined,
  recap: undefined as unknown,
  games: [] as unknown[],
  username: "marinacosta" as string | undefined,
  awardsEvent: null as unknown,
  ballot: undefined as unknown,
  categories: [] as unknown[],
  query: "",
  push: vi.fn(async () => {}),
  toBlob: vi.fn(),
  notifyError: vi.fn(),
}));

function translate(key: string, options?: Record<string, unknown>): string {
  const lookup = (path: string): unknown => {
    let value: unknown = ptBR;
    for (const part of path.split(".")) {
      value =
        typeof value === "object" && value !== null
          ? (value as Record<string, unknown>)[part]
          : undefined;
    }
    return value;
  };

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

vi.mock("html-to-image", () => ({ toBlob: mocks.toBlob }));

// Font loading is a browser boundary: the suite must never wait on it (and
// jsdom's `document.fonts` differs across environments).
vi.mock(
  "../../../../../packages/ui/src/components/wrapped/card/RecapCardFonts",
  () => ({
    RecapCardFonts: () => null,
    loadRecapFonts: vi.fn(async () => {}),
  }),
);

vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => mocks.sessionUserId }),
);
vi.mock(
  "../../../../../packages/ui/src/components/recap/hooks/useRecap",
  () => ({ useRecap: () => ({ data: mocks.recap, isPending: false }) }),
);
vi.mock(
  "../../../../../packages/ui/src/components/recap/hooks/useRecapStatus",
  () => ({
    useRecapStatus: () => ({
      data: { isRecapCreated: true, isRecapEligible: true, phase: "live" },
      isPending: false,
    }),
  }),
);
vi.mock(
  "../../../../../packages/ui/src/components/game/hooks/useGames",
  () => ({ useGames: () => ({ data: mocks.games }) }),
);
vi.mock(
  "../../../../../packages/ui/src/components/profile/hooks/useUserProfile",
  () => ({ useUserProfile: () => ({ data: { username: mocks.username } }) }),
);
vi.mock(
  "../../../../../packages/ui/src/components/awards/hooks/useCurrentAwardsEvent",
  () => ({ useCurrentAwardsEvent: () => ({ data: mocks.awardsEvent }) }),
);
vi.mock(
  "../../../../../packages/ui/src/components/awards/hooks/useAwardsBallot",
  () => ({ useAwardsBallot: () => ({ data: mocks.ballot }) }),
);
vi.mock(
  "../../../../../packages/ui/src/components/awards/hooks/useAwardEventCategories",
  () => ({ useAwardEventCategories: () => ({ data: mocks.categories }) }),
);
vi.mock("../../../../../packages/ui/src/util", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("../../../../../packages/ui/src/util")
    >();
  return { ...actual, createErrorNotification: mocks.notifyError };
});

const YEAR = 2026;
const USER_ID = "user-1";

function buildDailyPlaytime(): number[] {
  const daily = Array.from({ length: 365 }, () => 0);
  // March 1st is day 59 of a non-leap year; every March day has playtime and
  // the 14th is the busiest day.
  for (let day = 0; day < 31; day += 1) {
    daily[59 + day] = 3600;
  }
  daily[72] = 14_400;
  return daily;
}

function buildRecap(overrides: Partial<YearRecap> = {}): YearRecap {
  return {
    id: 1,
    year: YEAR,
    profileUserId: USER_ID,
    totalPlaytimeSeconds: 412 * 3600,
    totalPlayedGames: 38,
    totalAddedGames: 52,
    totalFinishedGames: 14,
    totalDroppedGames: 6,
    backlogGrowth: 32,
    isFinal: false,
    playedGames: [],
    playedGamesByPlatform: [],
    distributionByGenre: [],
    distributionByMode: [],
    distributionByTheme: [],
    distributionByPlatform: [],
    playtimeByPlatform: [],
    publishedAt: null,
    createdAt: "2026-11-15T04:00:00.000Z",
    updatedAt: "2026-11-15T04:00:00.000Z",
    deletedAt: null,
    topGames: [
      {
        gameId: 101,
        platformIds: [],
        totalPlaytimeSeconds: 86 * 3600,
        share: 0.21,
        firstPlayedAt: "2026-01-04T00:00:00.000Z",
        finishedAt: "2026-03-14T00:00:00.000Z",
        rating: 4.5,
      },
      {
        gameId: 102,
        platformIds: [],
        totalPlaytimeSeconds: 51 * 3600,
        share: 0.12,
        firstPlayedAt: null,
        finishedAt: null,
        rating: null,
      },
      // `topGames.length` is the distinct game count ("38 jogos"/"38 nós").
      ...Array.from({ length: 36 }, (_, index) => ({
        gameId: 300 + index,
        platformIds: [],
        totalPlaytimeSeconds: 3600,
        share: 0.01,
        firstPlayedAt: null,
        finishedAt: null,
        rating: null,
      })),
    ],
    calendar: {
      monthlyPlaytimeSeconds: Array.from({ length: 12 }, (_, month) =>
        month === 2 ? 71 * 3600 : 12 * 3600,
      ),
      topMonth: { month: 3, playtimeSeconds: 71 * 3600 },
      longestStreak: {
        start: "2026-03-01",
        end: "2026-03-23",
        days: 23,
      },
      topWeekday: { weekday: 6, share: 0.31 },
      weekendShare: 0.31,
    },
    dailyPlaytimeSeconds: buildDailyPlaytime(),
    communityHighlights: {
      minority: {
        gameId: 102,
        userRating: 4.5,
        communityAverage: 3.2,
        reviewCount: 1200,
        beyondShare: 0.12,
        sameRangeCount: 210,
      },
      inTune: {
        gameId: 101,
        userRating: 4.75,
        communityAverage: 4.65,
        reviewCount: 3400,
        beyondShare: 0.4,
        sameRangeCount: 2140,
      },
    },
    ...overrides,
  } as unknown as YearRecap;
}

function buildGames(): unknown[] {
  return [
    { id: 101, name: "Nioh 3", cover: null },
    { id: 102, name: "Marathon", cover: null },
  ];
}

function currentEvent(phase: string): CurrentAwardsEventDto {
  return {
    id: 7,
    year: YEAR,
    phase,
    categoriesCount: 12,
    createdAt: "2026-10-01T12:00:00.000Z",
    updatedAt: "2026-11-15T12:00:00.000Z",
    deletedAt: null,
    votingStartDate: "2026-12-01T00:00:00.000Z",
    votingEndDate: "2026-12-20T23:59:59.000Z",
    resultsDate: "2026-12-27T23:59:59.000Z",
    nominationStartDate: "2026-11-20T00:00:00.000Z",
    nominationEndDate: "2026-11-28T23:59:59.000Z",
    eligibilityCutoffDate: "2026-11-30T00:00:00.000Z",
  } as unknown as CurrentAwardsEventDto;
}

function votingBallot(): AwardsBallot {
  return {
    eventId: 7,
    year: YEAR,
    phase: "voting",
    categoriesVoted: 3,
    categoriesTotal: 12,
    categories: [
      {
        id: 12,
        name: "Jogo do Ano",
        description: "",
        order: 1,
        isPersonalGOTY: false,
        voteGameId: null,
        playedNomineesCount: 4,
        suggestedGameId: null,
        nominees: Array.from({ length: 6 }, (_, index) => ({
          gameId: 200 + index,
          status: "not_played",
          playtimeSeconds: 0,
          rating: null,
        })),
      },
    ],
  } as unknown as AwardsBallot;
}

function votingCategories(): VotableAwardsCategoryDto[] {
  return [
    { id: 12, isGOTY: true, name: "Jogo do Ano", order: 1 },
  ] as unknown as VotableAwardsCategoryDto[];
}

function createClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

const sharedOnShare = vi.fn(async () => {});

function renderScreen({
  query = "",
  onShare = sharedOnShare,
}: {
  query?: string;
  onShare?: (file: File) => Promise<void>;
} = {}) {
  mocks.query = query;

  return render(
    <RecapStoriesScreen userId={USER_ID} year={YEAR} onShare={onShare} />,
    {
      wrapper: ({ children }) => (
        <MantineProvider>
          <QueryClientProvider client={createClient()}>
            <UIProvider
              presenters={{
                Link: ({ href, children }) => <a href={href}>{children}</a>,
              }}
              hooks={{
                useRouter: () => ({
                  pathname: `/recap/${YEAR}/${USER_ID}/stories`,
                  asPath: `/recap/${YEAR}/${USER_ID}/stories${
                    mocks.query ? `?${mocks.query}` : ""
                  }`,
                  back: () => {},
                  push: mocks.push,
                  query: new URLSearchParams(mocks.query),
                }),
              }}
            >
              {children}
            </UIProvider>
          </QueryClientProvider>
        </MantineProvider>
      ),
    },
  );
}

const bars = () => screen.getAllByTestId("recap-story-bar");
const clickNext = () =>
  fireEvent.click(screen.getByRole("button", { name: "Próximo story" }));
const clickPrevious = () =>
  fireEvent.click(screen.getByRole("button", { name: "Story anterior" }));
const clickShare = (name = "Compartilhar") =>
  fireEvent.click(screen.getByRole("button", { name }));

beforeEach(() => {
  mocks.sessionUserId = undefined;
  mocks.recap = buildRecap();
  mocks.games = buildGames();
  mocks.username = "marinacosta";
  mocks.awardsEvent = null;
  mocks.ballot = undefined;
  mocks.categories = [];
  mocks.query = "";
  mocks.push.mockClear();
  mocks.toBlob.mockReset();
  mocks.toBlob.mockResolvedValue(new Blob(["png"], { type: "image/png" }));
  mocks.notifyError.mockReset();
  sharedOnShare.mockClear();

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
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("recap story helpers", () => {
  it("skips the community story without highlights before numbering", () => {
    expect(getAvailableRecapStoryIds(buildRecap())).toEqual([
      "opening",
      "topGame",
      "calendar",
      "community",
      "final",
    ]);
    expect(
      getAvailableRecapStoryIds(buildRecap({ communityHighlights: null })),
    ).toEqual(["opening", "topGame", "calendar", "final"]);
    expect(
      getAvailableRecapStoryIds(buildRecap({ calendar: null })),
    ).not.toContain("calendar");
  });

  it("clamps ?story=N to the filtered list", () => {
    const stories = getAvailableRecapStoryIds(
      buildRecap({ communityHighlights: null }),
    );
    expect(stories).toHaveLength(4);
    expect(resolveRecapStoryIndex(stories, "5")).toBe(3);
    expect(resolveRecapStoryIndex(stories, "2")).toBe(1);
    expect(resolveRecapStoryIndex(stories, "0")).toBe(0);
    expect(resolveRecapStoryIndex(stories, "nope")).toBe(0);
  });

  it("slices the top month from the UTC daily array", () => {
    const grid = getRecapMonthGrid(2026, 3, buildDailyPlaytime());
    expect(grid?.firstWeekday).toBe(0);
    expect(grid?.cells).toHaveLength(31);
    expect(grid?.cells[13].seconds).toBe(14_400);
    expect(grid?.cells[13].level).toBe(4);
    expect(grid?.cells[0].level).toBe(1);
  });

  it("reads the GOTY progress from the global GOTY category", () => {
    expect(getRecapGotyProgress(votingBallot(), votingCategories())).toEqual({
      played: 4,
      total: 6,
    });
    expect(getRecapGotyProgress(votingBallot(), [])).toBeNull();
  });
});

describe("RecapStoriesScreen", () => {
  it("draws each story from the recap data it requires", async () => {
    renderScreen();

    const opening = await screen.findByTestId("recap-story-opening");
    expect(opening.textContent).toContain("412 horas de jogo.");
    expect(opening.textContent).toContain("38 jogos, 14 zerados");

    clickNext();
    const topGame = screen.getByTestId("recap-story-topGame");
    expect(topGame.textContent).toContain("Nioh 3");
    expect(topGame.textContent).toContain("86 horas, 21% do seu ano.");
    expect(topGame.textContent).toContain("Zerado em 14 de março.");
    expect(topGame.textContent).toContain("9,0 sua nota");

    clickNext();
    const calendar = screen.getByTestId("recap-story-calendar");
    expect(calendar.textContent).toContain("Março foi o seu mês.");
    expect(calendar.textContent).toContain("71 h no mês");
    expect(calendar.textContent).toContain("23 dias seguidos");
    expect(calendar.textContent).toContain("Sábado seu dia");

    clickNext();
    const community = screen.getByTestId("recap-story-community");
    expect(community.textContent).toContain(
      "Em Marathon, você foi contra a maioria.",
    );
    expect(community.textContent).toContain("9,0");
    expect(community.textContent).toContain("6,4");
    expect(community.textContent).toContain(
      "Só 12% de quem avaliou deu 9 ou mais.",
    );
  });

  it("advances on the right half and goes back on the left half", async () => {
    renderScreen();

    expect(await screen.findByTestId("recap-story-opening")).toBeTruthy();
    expect(screen.getByText("1 / 5 · toque para seguir")).toBeTruthy();
    expect(bars()[0].dataset.active).toBe("true");

    clickNext();

    expect(screen.getByTestId("recap-story-topGame")).toBeTruthy();
    expect(screen.getByText("2 / 5 · toque para seguir")).toBeTruthy();
    expect(bars()[1].dataset.active).toBe("true");
    expect(bars()[0].dataset.active).toBe("false");

    clickPrevious();

    expect(screen.getByTestId("recap-story-opening")).toBeTruthy();
    expect(screen.getByText("1 / 5 · toque para seguir")).toBeTruthy();
  });

  it("closes back to the recap", async () => {
    renderScreen();

    expect(await screen.findByTestId("recap-story-opening")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Fechar" }));

    expect(mocks.push).toHaveBeenCalledWith(`/recap/${YEAR}/${USER_ID}`);
  });

  it("skips the community story and counts only the remaining ones", async () => {
    mocks.recap = buildRecap({ communityHighlights: null });
    renderScreen();

    expect(await screen.findByTestId("recap-story-opening")).toBeTruthy();
    expect(screen.getByText("1 / 4 · toque para seguir")).toBeTruthy();
    expect(screen.queryByTestId("recap-story-community")).toBeNull();

    clickNext();
    expect(screen.getByTestId("recap-story-topGame")).toBeTruthy();

    clickNext();
    expect(screen.getByTestId("recap-story-calendar")).toBeTruthy();
    expect(screen.queryByTestId("recap-story-community")).toBeNull();

    clickNext();
    expect(screen.getByTestId("recap-story-final")).toBeTruthy();
    expect(screen.getByText("4 / 4 · toque para seguir")).toBeTruthy();
  });

  it("opens the last story when ?story asks for one past the filtered list", async () => {
    mocks.recap = buildRecap({ communityHighlights: null });
    renderScreen({ query: "story=5" });

    expect(await screen.findByTestId("recap-story-final")).toBeTruthy();
    expect(screen.getByText("4 / 4 · toque para seguir")).toBeTruthy();
  });

  it("exports the visible story as a 1080x1920 PNG and shares it", async () => {
    const onShare = vi.fn(async () => {});
    renderScreen({ onShare });

    expect(await screen.findByTestId("recap-story-opening")).toBeTruthy();
    clickNext();
    expect(screen.getByTestId("recap-story-topGame")).toBeTruthy();

    clickShare();

    await waitFor(() => expect(onShare).toHaveBeenCalledTimes(1));
    expect(mocks.toBlob).toHaveBeenCalledWith(
      screen.getByTestId("recap-card"),
      expect.objectContaining({
        width: 1080,
        height: 1920,
        pixelRatio: 1,
        type: "image/png",
      }),
    );

    const file = (onShare.mock.calls[0] as unknown as [File])[0];
    expect(file).toBeInstanceOf(File);
    expect(file.type).toBe("image/png");
    expect(file.name).toMatch(/^gamenode-story-\d+\.png$/);
    expect(mocks.notifyError).not.toHaveBeenCalled();
  });

  it("reports a share failure and keeps the viewer open", async () => {
    const failure = new Error("share unavailable");
    const onShare = vi.fn(async () => {
      throw failure;
    });
    renderScreen({ onShare });

    expect(await screen.findByTestId("recap-story-opening")).toBeTruthy();
    clickShare();

    await waitFor(() => expect(mocks.notifyError).toHaveBeenCalled());
    expect(mocks.notifyError.mock.calls[0][0]).toBe(failure);
    expect(screen.getByTestId("recap-story-opening")).toBeTruthy();
  });

  it("offers the Awards action to the owner in voting", async () => {
    mocks.sessionUserId = USER_ID;
    mocks.awardsEvent = currentEvent("voting");
    mocks.ballot = votingBallot();
    mocks.categories = votingCategories();
    renderScreen({ query: "story=5" });

    expect(await screen.findByTestId("recap-story-final")).toBeTruthy();
    expect(screen.getByText("Votar no Awards 2026")).toBeTruthy();
    expect(
      screen.getByText("Você jogou 4 dos 6 indicados a GOTY."),
    ).toBeTruthy();
    expect(
      screen
        .getAllByRole("link")
        .some((link) =>
          link.getAttribute("href")?.startsWith("/awards/2026/vote"),
        ),
    ).toBe(true);
  });

  it("hides the Awards action outside the voting phase", async () => {
    mocks.sessionUserId = USER_ID;
    mocks.awardsEvent = currentEvent("results");
    renderScreen({ query: "story=5" });

    expect(await screen.findByTestId("recap-story-final")).toBeTruthy();
    expect(screen.queryByText("Votar no Awards 2026")).toBeNull();
  });

  it("invites a visitor to create an account on the last story", async () => {
    renderScreen({ query: "story=5" });

    const final = await screen.findByTestId("recap-story-final");
    expect(final.textContent).toContain("@marinacosta");
    expect(final.textContent).toContain("412 h em 2026");
    expect(final.textContent).toContain("38 jogos");
    expect(final.textContent).toContain("14 zerados");
    expect(final.textContent).toContain("Março mês mais intenso");
    expect(final.textContent).toContain("Nioh 3 jogo do ano");
    expect(screen.getByText("Crie sua conta e veja seu ano")).toBeTruthy();
    expect(screen.queryByText("Votar no Awards 2026")).toBeNull();
  });
});
