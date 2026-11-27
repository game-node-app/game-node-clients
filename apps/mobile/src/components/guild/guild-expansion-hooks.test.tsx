// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import {
  ApiError,
  GuildAccessResponseDto,
  GuildBoardQuestDto,
  GuildBoardResponseDto,
  GuildEmporiumResponseDto,
  GuildOverviewResponseDto,
  GuildService,
} from "@repo/wrapper/server";
import type {
  ClaimGuildPassportMilestoneResponseDto,
  GuildChainActionResponseDto,
  GuildEmporiumPurchaseResponseDto,
  RerollGuildBoardEntryResponseDto,
} from "@repo/wrapper/server";
import { guildKeys } from "../../../../../packages/ui/src/components/guild/hooks/guildKeys";
import { useAcceptGuildContract } from "../../../../../packages/ui/src/components/guild/hooks/useAcceptGuildContract";
import { useActivateGuildExtraSlotPermit } from "../../../../../packages/ui/src/components/guild/hooks/useActivateGuildExtraSlotPermit";
import { useClaimGuildPassportMilestone } from "../../../../../packages/ui/src/components/guild/hooks/useClaimGuildPassportMilestone";
import { useGuildBounties } from "../../../../../packages/ui/src/components/guild/hooks/useGuildBounties";
import { useGuildChains } from "../../../../../packages/ui/src/components/guild/hooks/useGuildChains";
import { useGuildEmporium } from "../../../../../packages/ui/src/components/guild/hooks/useGuildEmporium";
import { useGuildPassport } from "../../../../../packages/ui/src/components/guild/hooks/useGuildPassport";
import { usePurchaseGuildEmporiumItem } from "../../../../../packages/ui/src/components/guild/hooks/usePurchaseGuildEmporiumItem";
import { useRerollGuildBoardEntry } from "../../../../../packages/ui/src/components/guild/hooks/useRerollGuildBoardEntry";
import { useStartGuildChain } from "../../../../../packages/ui/src/components/guild/hooks/useStartGuildChain";

const session = vi.hoisted(() => ({
  userId: "user-1" as string | undefined,
  language: "en",
}));

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, string | number>) => {
      const entries = Object.entries(options ?? {});
      if (entries.length === 0) return key;
      return `${key}|${entries.map(([name, value]) => `${name}=${value}`).join(",")}`;
    },
    i18n: {
      language: session.language,
      resolvedLanguage: session.language,
    },
  }),
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

function quest(boardEntryId: string, templateKey: string): GuildBoardQuestDto {
  return {
    sourceType: GuildBoardQuestDto.sourceType.BOARD_ENTRY,
    boardEntryId,
    eventId: null,
    slug: null,
    category: GuildBoardQuestDto.category.WEEKLY,
    cycle: GuildBoardQuestDto.cycle.WEEKLY,
    templateKey,
    title: null,
    description: null,
    translations: [],
    rank: GuildBoardQuestDto.rank.D,
    xpReward: 150,
    sealsReward: 20,
    objectiveType: GuildBoardQuestDto.objectiveType.PLAY_DISTINCT_DAYS,
    targetCount: 4,
    criteria: {},
    candidateGames: [],
    meta: null,
    bonusObjective: null,
    rerollCount: 0,
    requiresTargetGame: false,
    reward: null,
    isRecommended: false,
    isQuick: true,
    contractDurationDays: 7,
    expiresAt: "2026-11-30T03:00:00.000Z",
  };
}

function board(
  quests: GuildBoardQuestDto[],
  overrides: Partial<GuildBoardResponseDto> = {},
): GuildBoardResponseDto {
  return {
    weekStart: "2026-11-16",
    nextRefreshAt: "2026-11-23T03:00:00.000Z",
    rerollsRemaining: 1,
    rerollChartersOwned: 0,
    monthlyExpeditionLocked: false,
    quests,
    ...overrides,
  };
}

const REROLL_RESPONSE = {
  quest: quest("board-1", "campaign_rhythm"),
  rerollsRemaining: 0,
  rerollChartersOwned: 2,
  consumableUsed: null,
} as unknown as RerollGuildBoardEntryResponseDto;

const PURCHASE_RESPONSE = {
  itemId: "item-1",
  priceSeals: 120,
  sealsBalance: 30,
  reward: null,
  chestResult: null,
  consumables: { hourglass: 1, reroll_charter: 0, extra_slot_permit: 0 },
} as unknown as GuildEmporiumPurchaseResponseDto;

const CHAIN_ACTION_RESPONSE = {
  contractId: "contract-1",
  chain: null,
} as unknown as GuildChainActionResponseDto;

const PASSPORT_CLAIM_RESPONSE = {
  monthKey: "2026-11",
  milestone: 4,
  claimedMilestones: [2, 4],
  completedContractsCount: 4,
  chestResult: null,
  sealsAwarded: 80,
  consumableKey: null,
  consumableQuantity: 0,
  xpAwarded: 75,
  globalXpAwarded: 18,
  rankBefore: "C",
  rankAfter: "C",
} as unknown as ClaimGuildPassportMilestoneResponseDto;

const PERMIT_RESPONSE = {
  weekStart: "2026-11-23",
  activeThisWeek: true,
  expiresAt: "2026-11-30T03:00:00.000Z",
  remainingPermits: 0,
};

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

function useExpansionReads() {
  const emporium = useGuildEmporium();
  const passport = useGuildPassport();
  const chains = useGuildChains();
  const bounties = useGuildBounties();

  return { emporium, passport, chains, bounties };
}

beforeEach(() => {
  vi.clearAllMocks();
  session.userId = "user-1";
  session.language = "en";
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  session.userId = "user-1";
  session.language = "en";
});

describe("Guild expansion reads", () => {
  it("calls none of the new reads for guests", async () => {
    session.userId = undefined;
    const access = vi
      .spyOn(GuildService, "guildControllerGetAccessV1")
      .mockResolvedValue(ACCESS_FALSE);
    const emporium = vi.spyOn(GuildService, "guildControllerGetEmporiumV1");
    const passport = vi.spyOn(GuildService, "guildControllerGetPassportV1");
    const chains = vi.spyOn(GuildService, "guildControllerListChainsV1");
    const bounties = vi.spyOn(GuildService, "guildControllerListBountiesV1");

    const client = createClient();
    renderHook(() => useExpansionReads(), {
      wrapper: createWrapper(client),
    });

    await waitFor(() => expect(access).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(client.getQueryState(guildKeys.access(undefined))?.status).toBe(
        "success",
      ),
    );

    expect(emporium).not.toHaveBeenCalled();
    expect(passport).not.toHaveBeenCalled();
    expect(chains).not.toHaveBeenCalled();
    expect(bounties).not.toHaveBeenCalled();
  });

  it("calls none of the new reads for a signed-in user without access", async () => {
    const access = vi
      .spyOn(GuildService, "guildControllerGetAccessV1")
      .mockResolvedValue(ACCESS_FALSE);
    const emporium = vi.spyOn(GuildService, "guildControllerGetEmporiumV1");
    const passport = vi.spyOn(GuildService, "guildControllerGetPassportV1");
    const chains = vi.spyOn(GuildService, "guildControllerListChainsV1");
    const bounties = vi.spyOn(GuildService, "guildControllerListBountiesV1");

    const client = createClient();
    renderHook(() => useExpansionReads(), {
      wrapper: createWrapper(client),
    });

    await waitFor(() => expect(access).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(client.getQueryState(guildKeys.access("user-1"))?.status).toBe(
        "success",
      ),
    );

    expect(emporium).not.toHaveBeenCalled();
    expect(passport).not.toHaveBeenCalled();
    expect(chains).not.toHaveBeenCalled();
    expect(bounties).not.toHaveBeenCalled();
  });

  it("requests the pt-BR bounty translations when the language starts with pt", async () => {
    session.language = "pt-BR";
    vi.spyOn(GuildService, "guildControllerGetAccessV1").mockResolvedValue(
      ACCESS_TRUE,
    );
    const bounties = vi
      .spyOn(GuildService, "guildControllerListBountiesV1")
      .mockResolvedValue({ bounties: [] });

    const client = createClient();
    const { result } = renderHook(() => useGuildBounties(), {
      wrapper: createWrapper(client),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(bounties).toHaveBeenCalledWith("pt-BR");
    expect(result.current.queryKey).toEqual([
      "guild",
      "bounties",
      "user-1",
      { locale: "pt-BR" },
    ]);
  });

  it("requests the en bounty translations otherwise", async () => {
    vi.spyOn(GuildService, "guildControllerGetAccessV1").mockResolvedValue(
      ACCESS_TRUE,
    );
    const bounties = vi
      .spyOn(GuildService, "guildControllerListBountiesV1")
      .mockResolvedValue({ bounties: [] });

    const client = createClient();
    const { result } = renderHook(() => useGuildBounties(), {
      wrapper: createWrapper(client),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(bounties).toHaveBeenCalledWith("en");
  });
});

describe("Guild expansion mutations", () => {
  it("replaces the rerolled quest in every cached board and updates the counters", async () => {
    const client = createClient();
    client.setQueryData(
      guildKeys.board("user-1", false),
      board([quest("board-1", "old_template"), quest("board-2", "other")]),
    );
    client.setQueryData(
      guildKeys.board("user-1", true),
      board([quest("board-1", "old_template")], {
        rerollsRemaining: 1,
        rerollChartersOwned: 0,
      }),
    );
    const reroll = vi
      .spyOn(GuildService, "guildControllerRerollBoardEntryV1")
      .mockResolvedValue(REROLL_RESPONSE);

    const { result } = renderHook(() => useRerollGuildBoardEntry(), {
      wrapper: createWrapper(client),
    });

    act(() => result.current.mutate({ boardEntryId: "board-1" }));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(reroll).toHaveBeenCalledWith("board-1");

    for (const quick of [false, true]) {
      const cached = client.getQueryData<GuildBoardResponseDto>(
        guildKeys.board("user-1", quick),
      );

      expect(cached?.rerollsRemaining).toBe(0);
      expect(cached?.rerollChartersOwned).toBe(2);
      expect(
        cached?.quests.find((item) => item.boardEntryId === "board-1")
          ?.templateKey,
      ).toBe("campaign_rhythm");
    }

    expect(
      client
        .getQueryData<GuildBoardResponseDto>(guildKeys.board("user-1", false))
        ?.quests.find((item) => item.boardEntryId === "board-2")?.templateKey,
    ).toBe("other");
  });

  it("sends the emporium item id when purchasing", async () => {
    const purchase = vi
      .spyOn(GuildService, "guildControllerPurchaseEmporiumItemV1")
      .mockResolvedValue(PURCHASE_RESPONSE);

    const { result } = renderHook(() => usePurchaseGuildEmporiumItem(), {
      wrapper: createWrapper(createClient()),
    });

    act(() => result.current.mutate({ emporiumItemId: "item-1" }));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(purchase).toHaveBeenCalledWith({ emporiumItemId: "item-1" });
  });

  it("interpolates the required rank from the cached emporium on a rank error", async () => {
    const client = createClient();
    client.setQueryData(guildKeys.emporium("user-1"), {
      sealsBalance: 10,
      monthKey: "2026-11",
      nextRotationAt: "2026-12-01T03:00:00.000Z",
      permanentItems: [{ id: "item-1", minRank: "C" }],
      rotatingItems: [],
    } as unknown as GuildEmporiumResponseDto);
    vi.spyOn(
      GuildService,
      "guildControllerPurchaseEmporiumItemV1",
    ).mockRejectedValue(
      apiError(403, {
        message: "This item requires Guild Rank C.",
        code: "guild_emporium_rank_required",
      }),
    );

    const { result } = renderHook(() => usePurchaseGuildEmporiumItem(), {
      wrapper: createWrapper(client),
    });

    act(() => result.current.mutate({ emporiumItemId: "item-1" }));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(notifications.show).toHaveBeenCalledWith({
      color: "red",
      message: "guild.errors.guild_emporium_rank_required|rank=C",
    });
  });

  it("sends targetGameId when starting a chain only if it is given", async () => {
    const start = vi
      .spyOn(GuildService, "guildControllerStartChainV1")
      .mockResolvedValue(CHAIN_ACTION_RESPONSE);

    const { result } = renderHook(() => useStartGuildChain(), {
      wrapper: createWrapper(createClient()),
    });

    act(() =>
      result.current.mutate({
        chainKey: "pathfinders_arc",
        targetGameId: 1029,
      }),
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(start).toHaveBeenNthCalledWith(1, "pathfinders_arc", {
      targetGameId: 1029,
    });

    act(() => result.current.mutate({ chainKey: "scholars_arc" }));

    await waitFor(() => expect(start).toHaveBeenCalledTimes(2));
    expect(start).toHaveBeenNthCalledWith(2, "scholars_arc", {});
  });

  it("claims the passport milestone passed as a number", async () => {
    const claim = vi
      .spyOn(GuildService, "guildControllerClaimPassportMilestoneV1")
      .mockResolvedValue(PASSPORT_CLAIM_RESPONSE);

    const { result } = renderHook(() => useClaimGuildPassportMilestone(), {
      wrapper: createWrapper(createClient()),
    });

    act(() => result.current.mutate({ milestone: 4 }));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(claim).toHaveBeenCalledWith("4");
  });

  it("interpolates max from the cached overview on the active-contract limit error", async () => {
    const client = createClient();
    client.setQueryData(guildKeys.overview("user-1"), {
      license: { perks: { maxActiveContracts: 4 } },
    } as unknown as GuildOverviewResponseDto);
    vi.spyOn(GuildService, "guildControllerAcceptContractV1").mockRejectedValue(
      apiError(409, {
        message: "You can hold at most 4 active contracts.",
        code: "guild_active_contract_limit_reached",
      }),
    );

    const { result } = renderHook(() => useAcceptGuildContract(), {
      wrapper: createWrapper(client),
    });

    act(() => result.current.mutate({ boardEntryId: "board-1" }));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(notifications.show).toHaveBeenCalledWith({
      color: "red",
      message: "guild.errors.guild_active_contract_limit_reached|max=4",
    });
  });

  it("invalidates every Guild read after a mutation", async () => {
    const client = createClient();
    const keys = [
      guildKeys.overview("user-1"),
      guildKeys.board("user-1", false),
      guildKeys.contracts("user-1", "accepted"),
      guildKeys.rewards("user-1"),
      guildKeys.emporium("user-1"),
      guildKeys.passport("user-1"),
      guildKeys.chains("user-1"),
      guildKeys.bounties("user-1", "en"),
    ];

    for (const key of keys) {
      client.setQueryData(key, {});
    }

    vi.spyOn(
      GuildService,
      "guildControllerActivateExtraSlotPermitV1",
    ).mockResolvedValue(PERMIT_RESPONSE);

    const { result } = renderHook(() => useActivateGuildExtraSlotPermit(), {
      wrapper: createWrapper(client),
    });

    act(() => result.current.mutate());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    await waitFor(() => {
      for (const key of keys) {
        expect(client.getQueryState(key)?.isInvalidated).toBe(true);
      }
    });
  });
});
