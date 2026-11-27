// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import {
  ApiError,
  GuildAccessResponseDto,
  GuildBoardResponseDto,
  GuildContractsListResponseDto,
  GuildOverviewResponseDto,
  GuildRewardsResponseDto,
  GuildService,
} from "@repo/wrapper/server";
import type {
  AcceptGuildContractResponseDto,
  GuildContractDto,
  LinaReceptionDto,
} from "@repo/wrapper/server";
import {
  GUILD_ACCESS_STALE_TIME,
  GUILD_QUERY_STALE_TIME,
  guildKeys,
  useAcceptGuildContract,
  useGuildAccess,
  useGuildBoard,
  useGuildContracts,
  useGuildOverview,
  useGuildRewards,
  useMarkGuildBoardSeen,
} from "../../../../../packages/ui/src/components/guild/hooks";

const session = vi.hoisted(() => ({
  userId: "user-1" as string | undefined,
}));

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@mantine/notifications", () => ({
  notifications: { show: vi.fn() },
}));

vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => session.userId }),
);

const ACCESS_TRUE: GuildAccessResponseDto = {
  mode: GuildAccessResponseDto.mode.SUPPORTERS,
  hasAccess: true,
};

const ACCESS_FALSE: GuildAccessResponseDto = {
  mode: GuildAccessResponseDto.mode.SUPPORTERS,
  hasAccess: false,
};

const OVERVIEW = {
  license: {
    licenseNumber: 47,
    rank: "C",
    xp: 1240,
    currentRankMinXp: 800,
    nextRank: "B",
    nextRankXp: 2000,
    xpToNextRank: 760,
    memberSince: "2026-01-04T12:00:00.000Z",
    equippedTitleKey: null,
    equippedFrameKey: null,
    stats: { finishedGames: 47, backlogGames: 23, reviewsCount: 12 },
  },
  activeContracts: [],
  yearGoal: null,
  counts: { boardCount: 3, acceptedCount: 2, completedCount: 12 },
  weekStart: "2026-11-16",
  nextRefreshAt: "2026-11-23T03:00:00.000Z",
  lina: {
    trigger: "weekly_board_refreshed",
    pose: "neutral",
    context: {},
    hasUnseenBoard: true,
  },
} as unknown as GuildOverviewResponseDto;

const BOARD = {
  weekStart: "2026-11-16",
  nextRefreshAt: "2026-11-23T03:00:00.000Z",
  rerollsRemaining: 1,
  rerollChartersOwned: 0,
  monthlyExpeditionLocked: false,
  quests: [],
} as GuildBoardResponseDto;

const CONTRACTS = {
  data: [],
  pagination: { totalItems: 0, totalPages: 0, hasNextPage: false },
} as GuildContractsListResponseDto;

const REWARDS = {
  unlockedRewards: [],
  equippedTitleKey: null,
  equippedFrameKey: null,
  equippedLicenseThemeKey: null,
  equippedStampStyleKey: null,
  equippedDecorKeys: [],
  showcaseBadgeIds: [],
  sealsBalance: 150,
  consumables: { hourglass: 0, reroll_charter: 0, extra_slot_permit: 0 },
} as GuildRewardsResponseDto;

const CONTRACT = {
  id: "contract-1",
  boardEntryId: "board-1",
  eventId: null,
  category: "library",
  templateKey: "forgotten_relic",
  rank: "B",
  xpReward: 250,
  objectiveType: "finish_game",
  criteria: {},
  targetGameId: 1029,
  targetGame: null,
  progressCurrent: 0,
  progressTarget: 1,
  status: "active",
  playtimeProgress: null,
  reward: null,
  event: null,
  claimPayload: null,
  acceptedAt: "2026-11-21T12:00:00.000Z",
  readyAt: null,
  claimedAt: null,
  expiresAt: "2026-11-23T03:00:00.000Z",
  createdAt: "2026-11-21T12:00:00.000Z",
  updatedAt: "2026-11-21T12:00:00.000Z",
} as unknown as GuildContractDto;

const LINA = {
  trigger: "contract_accepted",
  pose: "happy",
  context: {},
  hasUnseenBoard: false,
} as unknown as LinaReceptionDto;

const ACCEPT_RESPONSE = {
  contract: CONTRACT,
  lina: LINA,
} as AcceptGuildContractResponseDto;

function createClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function createWrapper(client: QueryClient) {
  return function Wrapper({ children }: React.PropsWithChildren) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };
}

function apiError(status: number, body: unknown): ApiError {
  return new ApiError(
    {} as unknown as ConstructorParameters<typeof ApiError>[0],
    {
      status,
      statusText: "",
      url: "/v1/guild",
      body,
      ok: false,
    },
    "guild error",
  );
}

function useAllGuildHooks() {
  const access = useGuildAccess();
  const overview = useGuildOverview();
  const board = useGuildBoard();
  const contracts = useGuildContracts("accepted");
  const rewards = useGuildRewards();

  return { access, overview, board, contracts, rewards };
}

function queryOptions(client: QueryClient, key: unknown[]) {
  return client.getQueryCache().find({ queryKey: key })?.options as
    | { staleTime?: number; refetchOnMount?: unknown }
    | undefined;
}

beforeEach(() => {
  vi.clearAllMocks();
  session.userId = "user-1";
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  session.userId = "user-1";
});

describe("Guild access gating", () => {
  it("calls only the public access endpoint for guests", async () => {
    session.userId = undefined;
    const access = vi
      .spyOn(GuildService, "guildControllerGetAccessV1")
      .mockResolvedValue(ACCESS_FALSE);
    const overview = vi.spyOn(GuildService, "guildControllerGetOverviewV1");
    const board = vi.spyOn(GuildService, "guildControllerGetBoardV1");
    const contracts = vi.spyOn(GuildService, "guildControllerListContractsV1");
    const rewards = vi.spyOn(GuildService, "guildControllerGetRewardsV1");

    const { result } = renderHook(() => useAllGuildHooks(), {
      wrapper: createWrapper(createClient()),
    });

    await waitFor(() => expect(result.current.access.isSuccess).toBe(true));

    expect(access).toHaveBeenCalledTimes(1);
    expect(overview).not.toHaveBeenCalled();
    expect(board).not.toHaveBeenCalled();
    expect(contracts).not.toHaveBeenCalled();
    expect(rewards).not.toHaveBeenCalled();
  });

  it("calls nothing else for a signed-in user without access", async () => {
    const access = vi
      .spyOn(GuildService, "guildControllerGetAccessV1")
      .mockResolvedValue(ACCESS_FALSE);
    const overview = vi.spyOn(GuildService, "guildControllerGetOverviewV1");
    const board = vi.spyOn(GuildService, "guildControllerGetBoardV1");
    const contracts = vi.spyOn(GuildService, "guildControllerListContractsV1");
    const rewards = vi.spyOn(GuildService, "guildControllerGetRewardsV1");

    const { result } = renderHook(() => useAllGuildHooks(), {
      wrapper: createWrapper(createClient()),
    });

    await waitFor(() => expect(result.current.access.isSuccess).toBe(true));

    expect(access).toHaveBeenCalledTimes(1);
    expect(overview).not.toHaveBeenCalled();
    expect(board).not.toHaveBeenCalled();
    expect(contracts).not.toHaveBeenCalled();
    expect(rewards).not.toHaveBeenCalled();
  });

  it("reads every resource when access is granted and applies the Guild freshness", async () => {
    vi.spyOn(GuildService, "guildControllerGetAccessV1").mockResolvedValue(
      ACCESS_TRUE,
    );
    vi.spyOn(GuildService, "guildControllerGetOverviewV1").mockResolvedValue(
      OVERVIEW,
    );
    vi.spyOn(GuildService, "guildControllerGetBoardV1").mockResolvedValue(
      BOARD,
    );
    vi.spyOn(GuildService, "guildControllerListContractsV1").mockResolvedValue(
      CONTRACTS,
    );
    vi.spyOn(GuildService, "guildControllerGetRewardsV1").mockResolvedValue(
      REWARDS,
    );

    const client = createClient();
    const { result } = renderHook(() => useAllGuildHooks(), {
      wrapper: createWrapper(client),
    });

    await waitFor(() => {
      expect(result.current.access.isSuccess).toBe(true);
      expect(result.current.overview.isSuccess).toBe(true);
      expect(result.current.board.isSuccess).toBe(true);
      expect(result.current.contracts.isSuccess).toBe(true);
      expect(result.current.rewards.isSuccess).toBe(true);
    });

    expect(result.current.access.queryKey).toEqual([
      "guild",
      "access",
      "user-1",
    ]);
    expect(result.current.board.queryKey).toEqual([
      "guild",
      "board",
      "user-1",
      { quick: false },
    ]);
    expect(result.current.contracts.queryKey).toEqual([
      "guild",
      "contracts",
      "user-1",
      "accepted",
    ]);

    expect(queryOptions(client, guildKeys.access("user-1"))?.staleTime).toBe(
      GUILD_ACCESS_STALE_TIME,
    );
    expect(queryOptions(client, guildKeys.overview("user-1"))?.staleTime).toBe(
      GUILD_QUERY_STALE_TIME,
    );
    expect(
      queryOptions(client, guildKeys.overview("user-1"))?.refetchOnMount,
    ).toBe(true);
  });

  it("flips access and re-reads it exactly once on a 403 guild_early_access_required", async () => {
    const access = vi
      .spyOn(GuildService, "guildControllerGetAccessV1")
      .mockResolvedValueOnce(ACCESS_TRUE)
      .mockResolvedValueOnce(ACCESS_FALSE);
    const board = vi
      .spyOn(GuildService, "guildControllerGetBoardV1")
      .mockRejectedValue(
        apiError(403, {
          message:
            "Adventurers Guild is currently in early access for supporters.",
          code: "guild_early_access_required",
        }),
      );

    const client = createClient();
    const { result } = renderHook(() => useGuildBoard(), {
      wrapper: createWrapper(client),
    });

    await waitFor(() => expect(result.current.error).toBeTruthy());
    await waitFor(() => expect(access).toHaveBeenCalledTimes(2));
    await waitFor(() =>
      expect(
        client.getQueryData<GuildAccessResponseDto>(guildKeys.access("user-1"))
          ?.hasAccess,
      ).toBe(false),
    );

    expect(board).toHaveBeenCalledTimes(1);
    expect(notifications.show).not.toHaveBeenCalled();
  });
});

describe("Guild mutations", () => {
  it("accepts with exactly one source id plus the target game", async () => {
    const accept = vi
      .spyOn(GuildService, "guildControllerAcceptContractV1")
      .mockResolvedValue(ACCEPT_RESPONSE);
    const { result } = renderHook(() => useAcceptGuildContract(), {
      wrapper: createWrapper(createClient()),
    });

    act(() =>
      result.current.mutate({
        boardEntryId: "board-1",
        eventId: "event-1",
        targetGameId: 1029,
      }),
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(accept).toHaveBeenCalledWith({
      boardEntryId: "board-1",
      targetGameId: 1029,
    });
  });

  it("accepts a curated event by eventId only", async () => {
    const accept = vi
      .spyOn(GuildService, "guildControllerAcceptContractV1")
      .mockResolvedValue(ACCEPT_RESPONSE);
    const { result } = renderHook(() => useAcceptGuildContract(), {
      wrapper: createWrapper(createClient()),
    });

    act(() => result.current.mutate({ eventId: "event-1" }));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(accept).toHaveBeenCalledWith({ eventId: "event-1" });
  });

  it("shows the translated limit message on guild_active_contract_limit_reached", async () => {
    vi.spyOn(GuildService, "guildControllerAcceptContractV1").mockRejectedValue(
      apiError(409, {
        message: "You can hold at most 3 active contracts.",
        code: "guild_active_contract_limit_reached",
      }),
    );
    const { result } = renderHook(() => useAcceptGuildContract(), {
      wrapper: createWrapper(createClient()),
    });

    act(() => result.current.mutate({ boardEntryId: "board-1" }));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(notifications.show).toHaveBeenCalledWith({
      color: "red",
      message: "guild.errors.guild_active_contract_limit_reached",
    });
  });

  it("hides the unseen board marker optimistically and keeps it hidden", async () => {
    const client = createClient();
    client.setQueryData(guildKeys.overview("user-1"), OVERVIEW);
    vi.spyOn(GuildService, "guildControllerMarkBoardSeenV1").mockResolvedValue({
      hasUnseenBoard: false,
      lastBoardSeenAt: "2026-11-21T12:00:00.000Z",
    });

    const { result } = renderHook(() => useMarkGuildBoardSeen(), {
      wrapper: createWrapper(client),
    });

    act(() => result.current.mutate());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(
      client.getQueryData<GuildOverviewResponseDto>(
        guildKeys.overview("user-1"),
      )?.lina.hasUnseenBoard,
    ).toBe(false);
  });
});
