// @vitest-environment jsdom
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ApiError,
  AwardsService,
  ConnectionsService,
  GameRepositoryService,
  ProfileService,
  RecapService,
  type RecapStatusDto,
  type YearRecapDto,
} from "@repo/wrapper/server";
import { YearRecapScreen } from "../../../../../packages/ui/src/components/recap/year/YearRecapScreen";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";
import type { LinkComponentProps } from "../../../../../packages/ui/src/util/link";
import {
  buildGame,
  buildTopGame,
  buildYearRecap,
  RECAP_YEAR,
} from "./year-recap-fixture";

const session = vi.hoisted(() => ({
  userId: undefined as string | undefined,
}));

vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => session.userId }),
);

vi.mock("../../../../../packages/ui/src/components/auth/authClient", () => ({
  authClient: { useSession: () => ({ data: null, isPending: false }) },
}));

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options ? `${key}:${JSON.stringify(options)}` : key,
    i18n: { language: "en", resolvedLanguage: "en" },
  }),
}));

vi.mock("@mantine/notifications", () => ({
  notifications: { show: vi.fn() },
}));

function apiError(status: number) {
  return new ApiError(
    {} as unknown as ConstructorParameters<typeof ApiError>[0],
    {
      status,
      statusText: "",
      url: "/v1/awards/events/current",
      body: { message: `error ${status}` },
      ok: false,
    },
    `error ${status}`,
  );
}

function status(overrides: Partial<RecapStatusDto> = {}): RecapStatusDto {
  return {
    isRecapCreated: true,
    isRecapEligible: true,
    phase: "live",
    ...overrides,
  } as RecapStatusDto;
}

const MockLink = ({ href, children }: LinkComponentProps) => (
  <a href={href}>{children}</a>
);

function renderScreen({
  year = RECAP_YEAR,
  userId = "user-1",
}: {
  year?: number;
  userId?: string;
} = {}) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(<YearRecapScreen year={year} userId={userId} />, {
    wrapper: ({ children }) => (
      <MantineProvider>
        <QueryClientProvider client={client}>
          <UIProvider
            presenters={{ Link: MockLink }}
            hooks={{
              useRouter: () => ({
                pathname: `/recap/${year}/${userId}`,
                asPath: `/recap/${year}/${userId}`,
                back: () => {},
                push: async () => {},
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

beforeEach(() => {
  vi.clearAllMocks();
  session.userId = undefined;
  window.localStorage.clear();

  vi.spyOn(
    AwardsService,
    "awardsControllerGetCurrentEventV1",
  ).mockRejectedValue(apiError(404));
  vi.spyOn(ProfileService, "profileControllerFindOneByIdV1").mockResolvedValue({
    username: "marina",
    avatar: null,
  } as unknown as Awaited<
    ReturnType<typeof ProfileService.profileControllerFindOneByIdV1>
  >);
  vi.spyOn(
    GameRepositoryService,
    "gameRepositoryControllerFindAllByIdsV1",
  ).mockResolvedValue([buildGame(1, "Nioh 3")]);
  vi.spyOn(
    ConnectionsService,
    "connectionsControllerFindOwnV1",
  ).mockResolvedValue([]);
  vi.spyOn(RecapService, "recapControllerGetGoalV1").mockResolvedValue({
    year: RECAP_YEAR + 1,
    target: null,
    finished: 0,
  });

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
  session.userId = undefined;
  window.localStorage.clear();
});

describe("YearRecapScreen status states", () => {
  it("tells the user the Recap is not ready without reading it", async () => {
    vi.spyOn(RecapService, "recapControllerGetRecapStatusV1").mockResolvedValue(
      status({ isRecapCreated: false, isRecapEligible: true }),
    );
    const getRecap = vi.spyOn(RecapService, "recapControllerGetRecapByYearV1");

    renderScreen();

    expect(
      await screen.findByText(
        `recap.page.states.notReadyTitle:${JSON.stringify({ year: RECAP_YEAR })}`,
      ),
    ).toBeTruthy();
    expect(getRecap).not.toHaveBeenCalled();
  });

  it("tells a non-eligible user there is no Recap for the year", async () => {
    vi.spyOn(RecapService, "recapControllerGetRecapStatusV1").mockResolvedValue(
      status({ isRecapCreated: false, isRecapEligible: false }),
    );
    const getRecap = vi.spyOn(RecapService, "recapControllerGetRecapByYearV1");

    renderScreen();

    expect(
      await screen.findByText(
        `recap.page.states.notEligibleTitle:${JSON.stringify({
          year: RECAP_YEAR,
        })}`,
      ),
    ).toBeTruthy();
    expect(getRecap).not.toHaveBeenCalled();
  });
});

describe("YearRecapScreen hero", () => {
  it("shows one node per game of the top games and the distinct game count", async () => {
    vi.spyOn(RecapService, "recapControllerGetRecapStatusV1").mockResolvedValue(
      status(),
    );
    vi.spyOn(RecapService, "recapControllerGetRecapByYearV1").mockResolvedValue(
      buildYearRecap({
        totalPlayedGames: 41,
        totalFinishedGames: 14,
        topGames: Array.from({ length: 38 }, (_, index) =>
          buildTopGame({
            gameId: index + 1,
            totalPlaytimeSeconds: (38 - index) * 3_600,
          }),
        ),
      }) as unknown as YearRecapDto,
    );

    renderScreen();

    await waitFor(() =>
      expect(screen.getAllByTestId("recap-hero-node")).toHaveLength(38),
    );
    expect(
      screen.getByText(
        `recap.page.hero.chartTitle:${JSON.stringify({ count: 38 })}`,
      ),
    ).toBeTruthy();
    expect(
      await screen.findByText(
        `recap.page.hero.summaryNamed:${JSON.stringify({
          name: "marina",
          games: 38,
          finished: "14",
        })}`,
      ),
    ).toBeTruthy();
  });

  it("hides the live marker and the daily note on a final Recap", async () => {
    vi.spyOn(RecapService, "recapControllerGetRecapStatusV1").mockResolvedValue(
      status(),
    );
    vi.spyOn(RecapService, "recapControllerGetRecapByYearV1").mockResolvedValue(
      buildYearRecap({
        isFinal: true,
        topGames: [buildTopGame()],
      }) as unknown as YearRecapDto,
    );

    renderScreen();

    await waitFor(() =>
      expect(screen.getAllByTestId("recap-hero-node")).toHaveLength(1),
    );
    expect(screen.queryByTestId("recap-hero-today")).toBeNull();
    expect(screen.queryByTestId("recap-hero-updates")).toBeNull();
  });

  it("shows the live marker and the daily note while the phase is live", async () => {
    vi.spyOn(RecapService, "recapControllerGetRecapStatusV1").mockResolvedValue(
      status(),
    );
    vi.spyOn(RecapService, "recapControllerGetRecapByYearV1").mockResolvedValue(
      buildYearRecap({ topGames: [buildTopGame()] }) as unknown as YearRecapDto,
    );

    renderScreen();

    await waitFor(() =>
      expect(screen.getAllByTestId("recap-hero-node")).toHaveLength(1),
    );
    expect(screen.getByTestId("recap-hero-today")).toBeTruthy();
    expect(screen.getByTestId("recap-hero-updates")).toBeTruthy();
  });
});

describe("YearRecapScreen visit mark", () => {
  it("marks the year as visited when the owner opens the Recap", async () => {
    const year = new Date().getUTCFullYear();
    session.userId = "user-1";
    vi.spyOn(RecapService, "recapControllerGetRecapStatusV1").mockResolvedValue(
      status(),
    );
    vi.spyOn(RecapService, "recapControllerGetRecapByYearV1").mockResolvedValue(
      buildYearRecap({
        year,
        topGames: [buildTopGame()],
      }) as unknown as YearRecapDto,
    );

    renderScreen({ year });

    await waitFor(() =>
      expect(
        window.localStorage.getItem(`gamenode.recap.visited.${year}`),
      ).toBe("1"),
    );
  });

  it("does not mark another user's Recap as visited", async () => {
    const year = new Date().getUTCFullYear();
    session.userId = "user-2";
    vi.spyOn(RecapService, "recapControllerGetRecapStatusV1").mockResolvedValue(
      status(),
    );
    vi.spyOn(RecapService, "recapControllerGetRecapByYearV1").mockResolvedValue(
      buildYearRecap({
        year,
        topGames: [buildTopGame()],
      }) as unknown as YearRecapDto,
    );

    renderScreen({ year });

    await waitFor(() =>
      expect(screen.getAllByTestId("recap-hero-node")).toHaveLength(1),
    );
    expect(
      window.localStorage.getItem(`gamenode.recap.visited.${year}`),
    ).toBeNull();
  });
});
