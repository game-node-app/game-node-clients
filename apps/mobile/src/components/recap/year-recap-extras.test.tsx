// @vitest-environment jsdom
import React from "react";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ApiError,
  AwardsService,
  ConnectionsService,
  UserConnectionDto,
  type AwardsBallotDto,
  type CurrentAwardsEventDto,
  type OwnUserConnectionDto,
  type VotableAwardsCategoryDto,
} from "@repo/wrapper/server";
import { RecapAwardsCard } from "../../../../../packages/ui/src/components/recap/year/RecapAwardsCard";
import { RecapBacklogSection } from "../../../../../packages/ui/src/components/recap/year/RecapBacklogSection";
import { RecapFooter } from "../../../../../packages/ui/src/components/recap/year/RecapFooter";
import { RecapGenresPlatformsSection } from "../../../../../packages/ui/src/components/recap/year/RecapGenresPlatformsSection";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";
import type { LinkComponentProps } from "../../../../../packages/ui/src/util/link";
import { buildYearRecap, RECAP_YEAR } from "./year-recap-fixture";

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

function votingEvent(): CurrentAwardsEventDto {
  return {
    id: 12,
    year: RECAP_YEAR,
    phase: "voting",
    categoriesCount: 1,
    createdAt: "2026-10-01T12:00:00.000Z",
    updatedAt: "2026-11-15T12:00:00.000Z",
    deletedAt: null,
    votingStartDate: "2026-12-01T00:00:00.000Z",
    votingEndDate: "2026-12-20T23:59:59.000Z",
    resultsDate: "2026-12-27T00:00:00.000Z",
    nominationStartDate: "2026-11-20T00:00:00.000Z",
    nominationEndDate: "2026-11-28T23:59:59.000Z",
    eligibilityCutoffDate: "2026-11-30T00:00:00.000Z",
  } as unknown as CurrentAwardsEventDto;
}

function gotyCategories(): VotableAwardsCategoryDto[] {
  return [
    {
      id: 7,
      eventId: 12,
      name: "Game of the Year",
      order: 1,
      description: "",
      isGOTY: true,
      isPersonalGOTY: false,
      isVotable: true,
      nomineeCount: 6,
    } as unknown as VotableAwardsCategoryDto,
  ];
}

function gotyBallot(): AwardsBallotDto {
  return {
    eventId: 12,
    year: RECAP_YEAR,
    phase: "voting",
    categoriesVoted: 0,
    categoriesTotal: 1,
    categories: [
      {
        id: 7,
        name: "Game of the Year",
        description: "",
        order: 1,
        isPersonalGOTY: false,
        voteGameId: null,
        playedNomineesCount: 4,
        suggestedGameId: null,
        nominees: Array.from({ length: 6 }, (_, index) => ({
          gameId: index + 1,
          status: "played",
          playtimeSeconds: 3_600,
          rating: 4,
        })),
      },
    ],
  } as unknown as AwardsBallotDto;
}

const MockLink = ({ href, children }: LinkComponentProps) => (
  <a href={href}>{children}</a>
);

function renderWithProviders(node: React.ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(node, {
    wrapper: ({ children }) => (
      <MantineProvider>
        <QueryClientProvider client={client}>
          <UIProvider
            presenters={{ Link: MockLink }}
            hooks={{
              useRouter: () => ({
                pathname: `/recap/${RECAP_YEAR}/user-1`,
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
  vi.spyOn(
    AwardsService,
    "awardsControllerGetCurrentEventV1",
  ).mockRejectedValue(apiError(404));
  vi.spyOn(
    AwardsService,
    "awardsControllerGetCategoriesByEventIdV1",
  ).mockResolvedValue([]);
  vi.spyOn(
    AwardsService,
    "awardsBallotControllerGetBallotV1",
  ).mockResolvedValue(gotyBallot());
  vi.spyOn(
    ConnectionsService,
    "connectionsControllerFindOwnV1",
  ).mockResolvedValue([]);
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
});

describe("RecapGenresPlatformsSection", () => {
  it("derives the genre percentages from the counts", () => {
    const recap = buildYearRecap({
      distributionByGenre: [
        {
          criteriaId: 1,
          criteriaName: "Adventure",
          count: 17,
          finishedCount: 4,
        },
        { criteriaId: 2, criteriaName: "RPG", count: 11, finishedCount: 2 },
        { criteriaId: 3, criteriaName: "Indie", count: 22, finishedCount: 9 },
      ],
    });

    renderWithProviders(<RecapGenresPlatformsSection recap={recap} />);

    expect(screen.getByTestId("recap-genres")).toBeTruthy();
    expect(screen.getByText("34%")).toBeTruthy();
    expect(screen.getByText("22%")).toBeTruthy();
    expect(screen.getByText("44%")).toBeTruthy();
  });

  it("is omitted without genres and platforms", () => {
    renderWithProviders(
      <RecapGenresPlatformsSection recap={buildYearRecap()} />,
    );

    expect(screen.queryByTestId("recap-genres-platforms")).toBeNull();
  });
});

describe("RecapBacklogSection", () => {
  it("omits the growth sentence when backlogGrowth is 0", () => {
    renderWithProviders(
      <RecapBacklogSection
        year={RECAP_YEAR}
        recap={buildYearRecap({ backlogGrowth: 0 })}
        userId={"user-1"}
      />,
    );

    expect(
      screen.getByText(
        `recap.page.backlog.summary:${JSON.stringify({
          added: "52",
          finished: "14",
        })}`,
      ),
    ).toBeTruthy();
    expect(screen.queryByText(/recap\.page\.backlog\.growth/)).toBeNull();
    expect(screen.getByText(/recap\.page\.backlog\.queued/)).toBeTruthy();
  });
});

describe("RecapAwardsCard", () => {
  it("is hidden for a visitor even during voting", () => {
    vi.spyOn(
      AwardsService,
      "awardsControllerGetCurrentEventV1",
    ).mockResolvedValue(votingEvent());
    const getBallot = vi.spyOn(
      AwardsService,
      "awardsBallotControllerGetBallotV1",
    );

    renderWithProviders(
      <RecapAwardsCard year={RECAP_YEAR} userId={"user-1"} />,
    );

    expect(screen.queryByTestId("recap-awards-card")).toBeNull();
    expect(getBallot).not.toHaveBeenCalled();
  });

  it("shows the GOTY count and the ballot link to the owner", async () => {
    session.userId = "user-1";
    vi.spyOn(
      AwardsService,
      "awardsControllerGetCurrentEventV1",
    ).mockResolvedValue(votingEvent());
    vi.spyOn(
      AwardsService,
      "awardsControllerGetCategoriesByEventIdV1",
    ).mockResolvedValue(gotyCategories());

    renderWithProviders(
      <RecapAwardsCard year={RECAP_YEAR} userId={"user-1"} />,
    );

    expect(await screen.findByTestId("recap-awards-card")).toBeTruthy();
    expect(
      await screen.findByText(
        `recap.page.awards.played:${JSON.stringify({
          played: "4",
          total: "6",
        })}`,
      ),
    ).toBeTruthy();
    const action = screen.getByText("recap.page.awards.action").closest("a");
    expect(action?.getAttribute("href")).toBe(`/awards/${RECAP_YEAR}/vote`);
  });
});

describe("RecapFooter", () => {
  it("shows the period without the sources for a visitor", () => {
    const connections = vi.spyOn(
      ConnectionsService,
      "connectionsControllerFindOwnV1",
    );

    renderWithProviders(
      <RecapFooter
        year={RECAP_YEAR}
        recap={buildYearRecap()}
        userId={"user-1"}
      />,
    );

    expect(
      screen.getByText(
        `recap.page.footer.period:${JSON.stringify({
          start: "Jan 1, 2026",
          end: "Nov 15, 2026",
        })}`,
      ),
    ).toBeTruthy();
    expect(screen.queryByText("recap.playtime.syncTitle")).toBeNull();
    expect(connections).not.toHaveBeenCalled();
  });

  it("shows each connected store and gives the history notice once", async () => {
    session.userId = "user-1";
    vi.spyOn(
      ConnectionsService,
      "connectionsControllerFindOwnV1",
    ).mockResolvedValue([
      {
        type: UserConnectionDto.type.PSN,
        lastSyncedAt: "2026-11-15T04:00:00Z",
      },
      { type: UserConnectionDto.type.NINTENDO },
      { type: UserConnectionDto.type.XBOX },
      { type: UserConnectionDto.type.EPICGAMES },
      { type: UserConnectionDto.type.GOG },
    ] as unknown as OwnUserConnectionDto[]);

    renderWithProviders(
      <RecapFooter
        year={RECAP_YEAR}
        recap={buildYearRecap()}
        userId={"user-1"}
      />,
    );

    expect(await screen.findByText("recap.playtime.syncTitle")).toBeTruthy();
    expect(screen.getByText("recap.playtime.syncDelay")).toBeTruthy();
    expect(
      screen
        .getByText("Playstation Network")
        .parentElement?.querySelector("time")?.dateTime,
    ).toBe("2026-11-15T04:00:00.000Z");
    expect(screen.getByText("Nintendo").parentElement?.textContent).toContain(
      "recap.playtime.noSync",
    );
    expect(screen.getByText("Xbox Live, Epic Games, and GOG.")).toBeTruthy();
    expect(screen.getAllByText("recap.playtime.afterConnection")).toHaveLength(
      1,
    );
  });
});
