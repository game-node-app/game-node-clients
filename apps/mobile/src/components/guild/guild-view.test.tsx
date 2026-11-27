// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { type ComponentProps, type ReactNode } from "react";
import { MantineProvider } from "@mantine/core";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  GuildAccessResponseDto,
  GuildContractDto,
  GuildService,
} from "@repo/wrapper/server";
import type {
  AcceptGuildContractResponseDto,
  CancelablePromise,
  GuildBoardQuestDto,
  GuildBoardResponseDto,
  GuildBoardSeenResponseDto,
  GuildContractsListResponseDto,
  GuildOverviewResponseDto,
  GuildPassportResponseDto,
  GuildRewardsResponseDto,
} from "@repo/wrapper/server";
import { GuildView } from "../../../../../packages/ui/src/components/guild/view/GuildView";
import type { GuildViewProps } from "../../../../../packages/ui/src/components/guild/view/GuildView";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";
import type { UIHookRegistry } from "../../../../../packages/ui/src/context/registry";

const session = vi.hoisted(() => ({
  userId: "user-1" as string | undefined,
  language: "pt-BR" as "pt-BR" | "en",
}));

vi.mock("@repo/locales", async () => {
  const dictionaries = {
    "pt-BR": (
      await import(
        "../../../../../packages/locales/src/translations/json/pt-BR.json"
      )
    ).default,
    en: (
      await import(
        "../../../../../packages/locales/src/translations/json/en.json"
      )
    ).default,
  };

  function lookup(dictionary: Record<string, unknown>, key: string): unknown {
    return key
      .split(".")
      .reduce<unknown>(
        (value, part) =>
          value && typeof value === "object"
            ? (value as Record<string, unknown>)[part]
            : undefined,
        dictionary,
      );
  }

  function translate(
    key: string,
    options: Record<string, unknown> = {},
  ): string {
    const dictionary = dictionaries[session.language] ?? dictionaries["pt-BR"];
    let template = lookup(dictionary, key);

    if (typeof template !== "string" && options.count !== undefined) {
      template = lookup(
        dictionary,
        `${key}_${options.count === 1 ? "one" : "other"}`,
      );
    }

    if (typeof template !== "string") return key;

    return template.replace(
      /\{\{\s*(\w+)\s*\}\}/g,
      (match: string, name: string) =>
        options[name] !== undefined ? String(options[name]) : match,
    );
  }

  return {
    useTranslation: () => ({
      t: translate,
      i18n: {
        language: session.language,
        resolvedLanguage: session.language,
      },
    }),
    useI18nContext: () => ({ language: session.language }),
  };
});

vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => session.userId }),
);

vi.mock("@mantine/notifications", () => ({
  notifications: { show: vi.fn() },
}));

vi.mock(
  "../../../../../packages/ui/src/components/guild/scene/GuildScene",
  () => ({
    GuildScene: ({
      variant,
      pose,
      isTalking,
      showAlert,
      decorKeys,
      dialogue,
    }: {
      variant: string;
      pose: string;
      isTalking: boolean;
      showAlert: boolean;
      decorKeys?: string[];
      dialogue?: ReactNode;
    }) => (
      <div
        data-testid="guild-scene"
        data-variant={variant}
        data-pose={pose}
        data-alert={String(showAlert)}
        data-talking={String(isTalking)}
        data-decor={decorKeys?.join(",") ?? undefined}
      >
        {dialogue}
      </div>
    ),
  }),
);

vi.mock(
  "../../../../../packages/ui/src/components/guild/scene/LinaDialogue",
  () => ({
    LinaDialogue: ({
      speaker,
      segments,
      options = [],
      collapsed,
      onExpand,
    }: {
      speaker: string;
      segments: { text: string; highlight?: boolean }[];
      options?: { id: string; label: string; onSelect(): void }[];
      collapsed?: boolean;
      onExpand?(): void;
    }) => {
      if (collapsed) {
        return (
          <button type="button" data-testid="lina-collapsed" onClick={onExpand}>
            {speaker}
          </button>
        );
      }

      return (
        <div data-testid="lina-dialogue">
          <span data-testid="lina-speaker">{speaker}</span>
          <span data-testid="lina-line">
            {segments.map((segment) => segment.text).join("")}
          </span>
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              data-option={option.id}
              onClick={option.onSelect}
            >
              {option.label}
            </button>
          ))}
        </div>
      );
    },
  }),
);

vi.mock(
  "../../../../../packages/ui/src/components/guild/view/GuildEarlyAccess",
  () => ({
    GuildEarlyAccess: ({ supporterHref }: { supporterHref: string }) => (
      <div data-testid="guild-early-access" data-href={supporterHref} />
    ),
  }),
);

vi.mock(
  "../../../../../packages/ui/src/components/guild/view/GuildSignInPrompt",
  () => ({
    GuildSignInPrompt: ({ signInHref }: { signInHref: string }) => (
      <div data-testid="guild-sign-in-prompt" data-href={signInHref} />
    ),
  }),
);

vi.mock(
  "../../../../../packages/ui/src/components/guild/view/GuildAcceptedState",
  () => ({
    GuildAcceptedState: ({
      opened,
      contract,
      onClose,
      onViewContracts,
    }: {
      opened: boolean;
      contract: { id: string };
      onClose(): void;
      onViewContracts(): void;
    }) =>
      opened ? (
        <div data-testid="guild-accepted-state" data-contract-id={contract.id}>
          <span>ACEITO</span>
          <button type="button" onClick={onClose}>
            close
          </button>
          <button type="button" onClick={onViewContracts}>
            contracts
          </button>
        </div>
      ) : null,
  }),
);

vi.mock(
  "../../../../../packages/ui/src/components/guild/view/GuildClaimCelebration",
  () => ({ GuildClaimCelebration: () => null }),
);

vi.mock(
  "../../../../../packages/ui/src/components/guild/view/GuildContractList",
  () => ({
    GuildContractList: ({ tab }: { tab: string }) => (
      <div data-testid="guild-contract-list" data-tab={tab} />
    ),
  }),
);

vi.mock(
  "../../../../../packages/ui/src/components/guild/view/GuildChains",
  () => ({
    GuildChains: ({ onShowAccepted }: { onShowAccepted?(): void }) => (
      <div data-testid="guild-chains">
        <button type="button" onClick={onShowAccepted}>
          show-accepted
        </button>
      </div>
    ),
  }),
);

vi.mock(
  "../../../../../packages/ui/src/components/guild/view/GuildBounties",
  () => ({
    GuildBounties: ({
      initialBountyId,
    }: {
      initialBountyId?: string | null;
    }) => (
      <div
        data-testid="guild-bounties"
        data-bounty-id={initialBountyId ?? undefined}
      >
        {initialBountyId ? (
          <article data-bounty-id={initialBountyId} data-highlighted="true" />
        ) : null}
      </div>
    ),
  }),
);

vi.mock(
  "../../../../../packages/ui/src/components/guild/view/GuildEmporium",
  () => ({
    GuildEmporium: () => <div data-testid="guild-emporium" />,
  }),
);

vi.mock(
  "../../../../../packages/ui/src/components/guild/view/GuildRewardsPanel",
  () => ({
    GuildRewardsPanel: () => <div data-testid="guild-rewards-panel" />,
  }),
);

const ACCESS_TRUE = {
  mode: GuildAccessResponseDto.mode.SUPPORTERS,
  hasAccess: true,
} as GuildAccessResponseDto;

const ACCESS_FALSE = {
  mode: GuildAccessResponseDto.mode.SUPPORTERS,
  hasAccess: false,
} as GuildAccessResponseDto;

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
    sealsBalance: 150,
    prestigeLevel: 0,
    prestigeXpIntoCurrent: 0,
    xpToNextPrestige: 0,
    perks: {
      maxActiveContracts: 3,
      weeklyRerolls: 1,
      monthlyExpedition: false,
      monthlyExpeditionRankS: false,
      monthlyFreeHourglass: 0,
      legendaryContracts: false,
    },
    equippedLicenseThemeKey: null,
    equippedStampStyleKey: null,
    equippedDecorKeys: [],
    showcaseBadgeIds: [],
    stats: { finishedGames: 47, backlogGames: 23, reviewsCount: 12 },
  },
  activeContracts: [],
  yearGoal: { year: 2026, target: 12, finished: 7 },
  counts: { boardCount: 1, acceptedCount: 0, completedCount: 0 },
  weekStart: "2026-11-16",
  nextRefreshAt: "2026-11-23T03:00:00.000Z",
  lina: {
    trigger: "stale_backlog_game",
    pose: "neutral",
    context: { gameId: 1029, gameName: "Hollow Knight", sinceYear: 2023 },
    hasUnseenBoard: true,
  },
  passport: {
    monthKey: "2026-11",
    completedContractsCount: 1,
    claimableMilestones: [],
  },
  activeChain: null,
  activeBountiesCount: 0,
} as unknown as GuildOverviewResponseDto;

/**
 * Shape persisted by the mobile React Query cache before the Guild expansion:
 * no perks, Prestige, Seals, cosmetics or Passport summary. Rehydrating it must
 * not crash the hall (the app refetches in the background).
 */
const LEGACY_CACHED_OVERVIEW = {
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
  yearGoal: { year: 2026, target: 12, finished: 7 },
  counts: { boardCount: 1, acceptedCount: 0, completedCount: 0 },
  weekStart: "2026-11-16",
  nextRefreshAt: "2026-11-23T03:00:00.000Z",
  lina: {
    trigger: "stale_backlog_game",
    pose: "neutral",
    context: { gameId: 1029, gameName: "Hollow Knight", sinceYear: 2023 },
    hasUnseenBoard: true,
  },
} as unknown as GuildOverviewResponseDto;

const RANK_S_OVERVIEW = {
  ...OVERVIEW,
  license: {
    ...OVERVIEW.license,
    rank: "S",
    xp: 7500,
    currentRankMinXp: 7500,
    nextRank: null,
    nextRankXp: null,
    xpToNextRank: 0,
  },
  counts: { boardCount: 0, acceptedCount: 0, completedCount: 0 },
  lina: {
    trigger: "default",
    pose: "neutral",
    context: {},
    hasUnseenBoard: false,
  },
} as unknown as GuildOverviewResponseDto;

const ACTIVE_BOUNTIES_OVERVIEW = {
  ...OVERVIEW,
  activeBountiesCount: 2,
} as unknown as GuildOverviewResponseDto;

const BOUNTY_READY_OVERVIEW = {
  ...OVERVIEW,
  activeBountiesCount: 1,
  lina: {
    trigger: "community_bounty_ready",
    pose: "happy",
    context: {},
    hasUnseenBoard: false,
  },
} as unknown as GuildOverviewResponseDto;

const RECOMMENDED_QUEST = {
  sourceType: "board_entry",
  boardEntryId: "board-1",
  eventId: null,
  slug: null,
  category: "library",
  templateKey: "forgotten_relic",
  title: null,
  description: null,
  translations: [],
  rank: "B",
  xpReward: 250,
  objectiveType: "finish_game",
  targetCount: 1,
  criteria: {},
  candidateGames: [
    {
      gameId: 1029,
      name: "Hollow Knight",
      slug: "hollow-knight",
      coverUrl: null,
      sinceYear: 2023,
    },
    {
      gameId: 3029,
      name: "Celeste",
      slug: "celeste",
      coverUrl: null,
      sinceYear: 2024,
    },
  ],
  meta: { sinceYear: 2023 },
  requiresTargetGame: true,
  reward: {
    id: "reward-1",
    key: "badge_archaeologist",
    kind: "badge",
    achievementId: "guild-archaeologist",
    inChestPool: false,
    chestBonusXp: 0,
  },
  isRecommended: true,
  isQuick: false,
  contractDurationDays: 21,
  expiresAt: "2026-11-23T03:00:00.000Z",
} as unknown as GuildBoardQuestDto;

const DAY_MS = 24 * 60 * 60 * 1000;

function daysFromNow(days: number): string {
  return new Date(Date.now() + days * DAY_MS).toISOString();
}

// `expiresAt` is only the accept deadline (2 days); the contract lasts 21.
const DURATION_QUEST = {
  ...RECOMMENDED_QUEST,
  isRecommended: false,
  expiresAt: daysFromNow(2),
} as GuildBoardQuestDto;

// Weekly multi-game quest: `targetCount: 2` and no target to pick.
const DOUBLE_FEATURE_QUEST = {
  sourceType: "board_entry",
  boardEntryId: "board-2",
  eventId: null,
  slug: null,
  category: "weekly",
  templateKey: "double_feature",
  title: null,
  description: null,
  translations: [],
  rank: "C",
  xpReward: 220,
  objectiveType: "finish_game",
  targetCount: 2,
  criteria: {},
  candidateGames: [],
  meta: null,
  requiresTargetGame: false,
  reward: {
    id: "reward-2",
    key: "weekly_chest",
    kind: "weekly_chest",
    achievementId: null,
    inChestPool: true,
    chestBonusXp: 0,
  },
  isRecommended: false,
  isQuick: false,
  contractDurationDays: 7,
  expiresAt: daysFromNow(3),
} as unknown as GuildBoardQuestDto;

const BOARD = {
  weekStart: "2026-11-16",
  nextRefreshAt: "2026-11-23T03:00:00.000Z",
  quests: [RECOMMENDED_QUEST],
} as GuildBoardResponseDto;

const EMPTY_BOARD = {
  ...BOARD,
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

const PASSPORT = {
  monthKey: "2026-11",
  completedContractsCount: 1,
  resetsAt: "2026-12-01T03:00:00.000Z",
  milestones: [],
} as GuildPassportResponseDto;

const ACCEPTED_CONTRACT = {
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
  targetGame: {
    gameId: 1029,
    name: "Hollow Knight",
    slug: "hollow-knight",
    coverUrl: null,
  },
  progressCurrent: 0,
  progressTarget: 1,
  status: GuildContractDto.status.ACTIVE,
  playtimeProgress: null,
  reward: RECOMMENDED_QUEST.reward,
  event: null,
  claimPayload: null,
  acceptedAt: "2026-11-21T12:00:00.000Z",
  readyAt: null,
  claimedAt: null,
  expiresAt: "2026-11-23T03:00:00.000Z",
  createdAt: "2026-11-21T12:00:00.000Z",
  updatedAt: "2026-11-21T12:00:00.000Z",
} as unknown as GuildContractDto;

const ACCEPT_RESPONSE = {
  contract: ACCEPTED_CONTRACT,
  lina: {
    trigger: "contract_accepted",
    pose: "happy",
    context: { targetGameName: "Hollow Knight" },
    hasUnseenBoard: false,
  },
} as AcceptGuildContractResponseDto;

function createClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, retryDelay: 0 },
      mutations: { retry: false },
    },
  });
}

const MockLink = ({ children, ...props }: ComponentProps<"a">) => (
  <a {...props}>{children}</a>
);

const HOOKS = {} as unknown as UIHookRegistry;

function createTree(client: QueryClient, props: Partial<GuildViewProps> = {}) {
  return (
    <MantineProvider>
      <QueryClientProvider client={client}>
        <UIProvider presenters={{ Link: MockLink }} hooks={HOOKS}>
          <GuildView supporterHref="/premium" {...props} />
        </UIProvider>
      </QueryClientProvider>
    </MantineProvider>
  );
}

function renderView(props: Partial<GuildViewProps> = {}) {
  return render(createTree(createClient(), props));
}

function setMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

function mockGuildApi(
  options: {
    overview?: GuildOverviewResponseDto;
    board?: GuildBoardResponseDto;
  } = {},
) {
  let boardSeen = false;

  const access = vi
    .spyOn(GuildService, "guildControllerGetAccessV1")
    .mockResolvedValue(ACCESS_TRUE);
  const overview = vi
    .spyOn(GuildService, "guildControllerGetOverviewV1")
    .mockImplementation(
      () =>
        Promise.resolve({
          ...(options.overview ?? OVERVIEW),
          lina: {
            ...(options.overview ?? OVERVIEW).lina,
            hasUnseenBoard: !boardSeen,
          },
        }) as unknown as CancelablePromise<GuildOverviewResponseDto>,
    );
  const board = vi
    .spyOn(GuildService, "guildControllerGetBoardV1")
    .mockResolvedValue(options.board ?? BOARD);
  const markSeen = vi
    .spyOn(GuildService, "guildControllerMarkBoardSeenV1")
    .mockImplementation(() => {
      boardSeen = true;
      return Promise.resolve({
        hasUnseenBoard: false,
        lastBoardSeenAt: "2026-11-21T12:00:00.000Z",
      }) as unknown as CancelablePromise<GuildBoardSeenResponseDto>;
    });
  const accept = vi
    .spyOn(GuildService, "guildControllerAcceptContractV1")
    .mockResolvedValue(ACCEPT_RESPONSE);
  const contracts = vi
    .spyOn(GuildService, "guildControllerListContractsV1")
    .mockResolvedValue(CONTRACTS);
  const rewards = vi
    .spyOn(GuildService, "guildControllerGetRewardsV1")
    .mockResolvedValue(REWARDS);
  const passport = vi
    .spyOn(GuildService, "guildControllerGetPassportV1")
    .mockResolvedValue(PASSPORT);

  return {
    access,
    overview,
    board,
    markSeen,
    accept,
    contracts,
    rewards,
    passport,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  session.userId = "user-1";
  session.language = "pt-BR";

  setMatchMedia(false);

  window.requestAnimationFrame = vi.fn((callback: (time: number) => void) => {
    callback(0);
    return 0;
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
});

describe("GuildView access gate", () => {
  it("shows the sign-in prompt to guests and calls no other Guild endpoint", async () => {
    session.userId = undefined;
    const access = vi
      .spyOn(GuildService, "guildControllerGetAccessV1")
      .mockResolvedValue(ACCESS_FALSE);
    const overview = vi.spyOn(GuildService, "guildControllerGetOverviewV1");
    const board = vi.spyOn(GuildService, "guildControllerGetBoardV1");
    const contracts = vi.spyOn(GuildService, "guildControllerListContractsV1");
    const rewards = vi.spyOn(GuildService, "guildControllerGetRewardsV1");
    const markSeen = vi.spyOn(GuildService, "guildControllerMarkBoardSeenV1");

    renderView();

    const prompt = await screen.findByTestId("guild-sign-in-prompt");
    expect(prompt).toHaveAttribute("data-href", "/auth");
    expect(access).toHaveBeenCalledTimes(1);
    expect(overview).not.toHaveBeenCalled();
    expect(board).not.toHaveBeenCalled();
    expect(contracts).not.toHaveBeenCalled();
    expect(rewards).not.toHaveBeenCalled();
    expect(markSeen).not.toHaveBeenCalled();
  });

  it("shows the early-access screen to signed-in players without access", async () => {
    const access = vi
      .spyOn(GuildService, "guildControllerGetAccessV1")
      .mockResolvedValue(ACCESS_FALSE);
    const overview = vi.spyOn(GuildService, "guildControllerGetOverviewV1");
    const board = vi.spyOn(GuildService, "guildControllerGetBoardV1");

    renderView({ supporterHref: "/premium" });

    const earlyAccess = await screen.findByTestId("guild-early-access");
    expect(earlyAccess).toHaveAttribute("data-href", "/premium");
    expect(access).toHaveBeenCalledTimes(1);
    expect(overview).not.toHaveBeenCalled();
    expect(board).not.toHaveBeenCalled();
  });

  it("renders the hall only when the access response allows it", async () => {
    mockGuildApi();

    renderView();

    expect(await screen.findByText("Nº 0047")).toBeInTheDocument();
    expect(screen.queryByTestId("guild-sign-in-prompt")).toBeNull();
    expect(screen.queryByTestId("guild-early-access")).toBeNull();
  });

  it("shows a retryable error instead of the early-access gate when access fails for a signed-in user", async () => {
    const access = vi
      .spyOn(GuildService, "guildControllerGetAccessV1")
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce(ACCESS_FALSE);
    const overview = vi.spyOn(GuildService, "guildControllerGetOverviewV1");
    const board = vi.spyOn(GuildService, "guildControllerGetBoardV1");

    renderView({ supporterHref: "/premium" });

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(
      "Não foi possível verificar seu acesso à Guilda agora. Tente novamente em instantes.",
    );
    expect(screen.queryByTestId("guild-early-access")).toBeNull();
    expect(screen.queryByTestId("guild-sign-in-prompt")).toBeNull();
    expect(overview).not.toHaveBeenCalled();
    expect(board).not.toHaveBeenCalled();

    fireEvent.click(
      within(alert).getByRole("button", { name: "Tentar novamente" }),
    );

    const earlyAccess = await screen.findByTestId("guild-early-access");
    expect(earlyAccess).toHaveAttribute("data-href", "/premium");
    expect(access).toHaveBeenCalledTimes(2);
    expect(overview).not.toHaveBeenCalled();
    expect(board).not.toHaveBeenCalled();
  });

  it("shows a retryable error instead of the sign-in prompt when access fails for a guest", async () => {
    session.userId = undefined;
    const access = vi
      .spyOn(GuildService, "guildControllerGetAccessV1")
      .mockRejectedValueOnce(new Error("Service unavailable"))
      .mockResolvedValueOnce(ACCESS_FALSE);
    const overview = vi.spyOn(GuildService, "guildControllerGetOverviewV1");
    const board = vi.spyOn(GuildService, "guildControllerGetBoardV1");

    renderView();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(
      "Não foi possível verificar seu acesso à Guilda agora. Tente novamente em instantes.",
    );
    expect(screen.queryByTestId("guild-sign-in-prompt")).toBeNull();
    expect(screen.queryByTestId("guild-early-access")).toBeNull();
    expect(overview).not.toHaveBeenCalled();
    expect(board).not.toHaveBeenCalled();

    fireEvent.click(
      within(alert).getByRole("button", { name: "Tentar novamente" }),
    );

    const prompt = await screen.findByTestId("guild-sign-in-prompt");
    expect(prompt).toHaveAttribute("data-href", "/auth");
    expect(access).toHaveBeenCalledTimes(2);
    expect(overview).not.toHaveBeenCalled();
    expect(board).not.toHaveBeenCalled();
  });
});

describe("Guild Hall", () => {
  it("renders a persisted overview cached before the license perks existed", async () => {
    mockGuildApi({ overview: LEGACY_CACHED_OVERVIEW });

    const { container } = renderView();

    expect(await screen.findByText("Nº 0047")).toBeInTheDocument();

    // No perks block to disclose, and the cap falls back to rank E–C's three.
    expect(container.querySelector("[data-license-perks]")).toBeNull();
    expect(container.querySelector("[data-contracts-cap]")).toHaveAttribute(
      "data-max-active-contracts",
      "3",
    );
  });

  it("renders the license scenario, the recommended quest and the Lina options", async () => {
    const api = mockGuildApi();

    renderView();

    expect(await screen.findByText("Nº 0047")).toBeInTheDocument();
    expect(api.access).toHaveBeenCalledTimes(1);
    expect(api.overview).toHaveBeenCalled();
    expect(api.board).toHaveBeenCalledWith(undefined);

    // Header: pt-BR XP formatting and rank badge (single progressbar HUD).
    expect(screen.getByText("1.240 / 2.000 XP")).toBeInTheDocument();
    expect(screen.getByText("RANK C")).toBeInTheDocument();
    expect(screen.getAllByRole("progressbar")).toHaveLength(1);

    // License card: identity, stamp and collection stats without duplicate XP bar.
    expect(screen.queryByText("Próximo rank: B")).toBeNull();
    expect(screen.queryByText("faltam 760 XP")).toBeNull();
    expect(screen.getByText("C").parentElement).toHaveAttribute(
      "data-rank",
      "C",
    );
    expect(screen.getByText("Zerados")).toBeInTheDocument();
    expect(screen.getByText("No backlog")).toBeInTheDocument();
    expect(screen.getByText("Reviews")).toBeInTheDocument();
    expect(screen.getByText("47")).toBeInTheDocument();
    expect(screen.getByText("23")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();

    // Lina dialogue options are trimmed to 3 contextual actions.
    const dialogue = screen.getByTestId("lina-dialogue");
    const linaOptions = within(dialogue).getAllByRole("button");
    expect(linaOptions.map((btn) => btn.getAttribute("data-option"))).toEqual([
      "board",
      "emporium",
      "goodbye",
    ]);

    // Recommended forgotten_relic card.
    await screen.findByText("Relíquia Esquecida");
    expect(screen.getByText("★ Lina recomenda")).toBeInTheDocument();
    expect(screen.getByText("Da sua biblioteca")).toBeInTheDocument();
    expect(screen.getByText("Relíquia Esquecida")).toBeInTheDocument();
    expect(screen.getByText("+250 XP")).toBeInTheDocument();
    expect(screen.getByText("Arqueólogo")).toBeInTheDocument();
    expect(screen.getByText("Hollow Knight")).toBeInTheDocument();
    expect(screen.getByText("Celeste")).toBeInTheDocument();
    expect(screen.getByText("desde 2023")).toBeInTheDocument();
    expect(screen.getByText("desde 2024")).toBeInTheDocument();

    const card = screen.getByText("Relíquia Esquecida").closest("article");
    expect(card).not.toBeNull();
    expect(card).toHaveAttribute("data-recommended", "true");
    expect(card?.querySelector('[data-rank="B"]')).toBeInTheDocument();

    // Lina's stale backlog line and the unseen-board alert.
    expect(screen.getByTestId("lina-line").textContent).toContain(
      "Hollow Knight",
    );
    expect(screen.getByTestId("lina-line").textContent).toContain("desde 2023");
    expect(screen.getByTestId("guild-scene")).toHaveAttribute(
      "data-alert",
      "true",
    );
    expect(screen.getByTestId("guild-scene")).toHaveAttribute(
      "data-pose",
      "neutral",
    );

    // Board tab and its server count.
    expect(screen.getByRole("tab", { name: /Pedidos/ })).toHaveAttribute(
      "data-tab",
      "board",
    );
    expect(screen.getByRole("tab", { name: /Pedidos/ }).textContent).toContain(
      "1",
    );
  });

  it("uses the desktop composition with the dialogue over the scene at md and above", async () => {
    setMatchMedia(true);
    mockGuildApi();

    renderView();

    expect(await screen.findByText("Nº 0047")).toBeInTheDocument();
    expect(
      screen.getByText(/Quadro de pedidos renovado toda segunda/),
    ).toBeInTheDocument();

    const scene = screen.getByTestId("guild-scene");
    expect(scene).toHaveAttribute("data-variant", "desktop");
    expect(within(scene).getByTestId("lina-dialogue")).toBeInTheDocument();
    expect(screen.getByTestId("guild-rewards-panel")).toBeInTheDocument();
    expect(
      await screen.findByText("Passaporte Mensal da Guilda"),
    ).toBeInTheDocument();
  });

  it("renders the mobile composition below md", async () => {
    mockGuildApi();

    renderView();

    expect(await screen.findByText("Nº 0047")).toBeInTheDocument();

    const scene = screen.getByTestId("guild-scene");
    expect(scene).toHaveAttribute("data-variant", "mobile");
    expect(within(scene).queryByTestId("lina-dialogue")).toBeNull();
    expect(screen.getByTestId("lina-dialogue")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Pedidos/ })).toBeInTheDocument();
  });

  it("puts active contracts and the board before the License, Passport, and Rewards panel on mobile", async () => {
    mockGuildApi();

    const { container } = renderView();

    expect(await screen.findByText("Nº 0047")).toBeInTheDocument();

    const tablist = await screen.findByRole("tablist");
    const tabpanel = screen.getByRole("tabpanel");
    const rewards = screen.getByTestId("guild-rewards-panel");
    const passport = await waitFor(() => {
      const node = container.querySelector("[data-passport-month]");
      expect(node).not.toBeNull();
      return node as HTMLElement;
    });
    const license = container.querySelector("[data-license-perks]");
    const contracts = container
      .querySelector("[data-contracts-cap]")
      ?.closest("section") as HTMLElement | null;

    expect(tabpanel).toHaveAttribute("id", "guild-tabpanel-board");
    expect(tabpanel).toHaveAttribute("aria-labelledby", "guild-tab-board");
    expect(contracts).not.toBeNull();
    expect(
      (contracts as HTMLElement).compareDocumentPosition(tablist) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      tablist.compareDocumentPosition(tabpanel) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      tabpanel.compareDocumentPosition(passport) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      tabpanel.compareDocumentPosition(rewards) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      passport.compareDocumentPosition(rewards) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    // The License card sits below the board and before the Passport on mobile.
    if (license) {
      expect(
        tabpanel.compareDocumentPosition(license) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      expect(
        license.compareDocumentPosition(passport) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }
  });

  it("leads the desktop board column with the active contracts, above the tab strip", async () => {
    setMatchMedia(true);
    mockGuildApi();

    const { container } = renderView();

    expect(await screen.findByText("Nº 0047")).toBeInTheDocument();

    const tablist = await screen.findByRole("tablist");
    const cap = container.querySelector("[data-contracts-cap]");
    const contracts = cap?.closest("section") ?? null;
    const sidebar = container.querySelector("aside");

    expect(contracts).not.toBeNull();
    expect(sidebar).not.toBeNull();
    expect(
      (contracts as HTMLElement).compareDocumentPosition(tablist) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    // Not in the sidebar any more: the sidebar holds License, Passport, Rewards.
    expect(sidebar?.contains(contracts)).toBe(false);
    expect(sidebar?.contains(screen.getByTestId("guild-rewards-panel"))).toBe(
      true,
    );
    // The tab strip wrapper is the next sibling inside the same board column.
    expect(contracts?.nextElementSibling?.contains(tablist)).toBe(true);
  });

  it("opens the requested initial tab for notification deep-links", async () => {
    const api = mockGuildApi();

    renderView({ initialTab: "accepted" });

    expect(await screen.findByTestId("guild-contract-list")).toHaveAttribute(
      "data-tab",
      "accepted",
    );
    expect(api.board).not.toHaveBeenCalled();
  });

  it("re-reads the board with quick=true from the board toolbar and offers a way back", async () => {
    const api = mockGuildApi();

    renderView();

    await screen.findByText("Relíquia Esquecida");

    const toggle = screen.getByRole("button", { name: "Missões rápidas" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(toggle);

    await waitFor(() => expect(api.board).toHaveBeenCalledWith(true));
    expect(screen.getByText("Pedidos rápidos")).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Missões rápidas" }),
      ).toHaveAttribute("aria-pressed", "true"),
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Voltar ao quadro completo" }),
    );

    await waitFor(() =>
      expect(screen.queryByText("Pedidos rápidos")).toBeNull(),
    );
  });

  it("marks the board as seen once from Lina's option and hides the alert", async () => {
    const api = mockGuildApi();

    renderView();

    await screen.findByText("Relíquia Esquecida");

    const boardOption = screen.getByRole("button", {
      name: "Me mostra o quadro de pedidos",
    });

    fireEvent.click(boardOption);

    await waitFor(() => expect(api.markSeen).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(screen.getByTestId("guild-scene")).toHaveAttribute(
        "data-alert",
        "false",
      ),
    );

    // The mutation is optimistic; a second activation must not duplicate it.
    fireEvent.click(boardOption);
    expect(api.markSeen).toHaveBeenCalledTimes(1);
  });

  it("accepts the recommended quest with the preselected target game", async () => {
    const api = mockGuildApi();

    renderView();

    await screen.findByText("Relíquia Esquecida");

    fireEvent.click(screen.getByRole("button", { name: "Aceitar" }));

    const dialog = await screen.findByRole("dialog");

    expect(
      within(dialog).getByText("Qual jogo vai cumprir este pedido?"),
    ).toBeInTheDocument();

    const candidates = within(dialog).getAllByRole("radio");
    expect(candidates).toHaveLength(2);
    expect(candidates[0]).toHaveAttribute("aria-checked", "true");
    expect(candidates[1]).toHaveAttribute("aria-checked", "false");
    expect(candidates[0].textContent).toContain("Hollow Knight");
    expect(candidates[0].textContent).toContain("desde 2023");

    fireEvent.click(
      within(dialog).getByRole("button", { name: "Aceitar pedido" }),
    );

    await waitFor(() =>
      expect(api.accept).toHaveBeenCalledWith({
        boardEntryId: "board-1",
        targetGameId: 1029,
      }),
    );
    expect(api.accept).toHaveBeenCalledTimes(1);

    const accepted = await screen.findByTestId("guild-accepted-state");
    expect(accepted).toHaveAttribute("data-contract-id", "contract-1");

    fireEvent.click(
      within(accepted).getByRole("button", { name: "contracts" }),
    );

    await waitFor(() =>
      expect(screen.getByTestId("guild-contract-list")).toHaveAttribute(
        "data-tab",
        "accepted",
      ),
    );
  });

  it("states the contract duration from contractDurationDays, not the accept deadline", async () => {
    mockGuildApi({ board: { ...BOARD, quests: [DURATION_QUEST] } });

    renderView();

    await screen.findByText("Relíquia Esquecida");

    const card = screen.getByText("Relíquia Esquecida").closest("article");
    expect(card).not.toBeNull();

    expect(
      within(card as HTMLElement).getByText(
        "21 dias para concluir depois de aceitar",
      ),
    ).toBeInTheDocument();
    expect(within(card as HTMLElement).queryByText(/2 dias/)).toBeNull();
    expect(
      within(card as HTMLElement).getByText(
        /Só contam jogos que você marcar como zerados depois de aceitar/,
      ),
    ).toBeInTheDocument();
  });

  it("accepts a multi-game quest without a picker or targetGameId", async () => {
    const api = mockGuildApi({
      board: { ...BOARD, quests: [DOUBLE_FEATURE_QUEST] },
    });

    renderView();

    await screen.findByText("Sessão Dupla");

    fireEvent.click(screen.getByRole("button", { name: "Aceitar" }));

    expect(screen.queryByRole("dialog")).toBeNull();
    await waitFor(() =>
      expect(api.accept).toHaveBeenCalledWith({ boardEntryId: "board-2" }),
    );
    expect(api.accept).toHaveBeenCalledTimes(1);
    expect(await screen.findByTestId("guild-accepted-state")).toHaveAttribute(
      "data-contract-id",
      "contract-1",
    );
  });

  it("hides a quest locally on Not now without any request", async () => {
    const api = mockGuildApi();
    const boardCallsBefore = api.board.mock.calls.length;

    renderView();

    await screen.findByText("Relíquia Esquecida");

    fireEvent.click(screen.getByRole("button", { name: "Agora não" }));

    expect(screen.queryByText("Relíquia Esquecida")).toBeNull();
    expect(api.accept).not.toHaveBeenCalled();
    expect(api.markSeen).not.toHaveBeenCalled();
    expect(api.board).toHaveBeenCalledTimes(boardCallsBefore + 1);
  });

  it("shows a full bar and no next rank at rank S in the header HUD", async () => {
    mockGuildApi({ overview: RANK_S_OVERVIEW, board: EMPTY_BOARD });

    renderView();

    await screen.findByText("Nº 0047");
    expect(screen.getByText("7.500 XP")).toBeInTheDocument();
    expect(screen.queryByText(/Próximo rank:/)).toBeNull();
    expect(screen.queryByText("Rank máximo alcançado")).toBeNull();

    const bars = screen.getAllByRole("progressbar");
    expect(bars).toHaveLength(1);
    expect(bars[0]).toHaveAttribute("aria-valuenow", "100");
  });

  it("shows a retryable GuildQueryError when the hall overview fails", async () => {
    vi.spyOn(GuildService, "guildControllerGetAccessV1").mockResolvedValue(
      ACCESS_TRUE,
    );
    const overview = vi
      .spyOn(GuildService, "guildControllerGetOverviewV1")
      .mockRejectedValueOnce(new Error("Overview failed"))
      .mockRejectedValueOnce(new Error("Overview failed"))
      .mockRejectedValueOnce(new Error("Overview failed"))
      .mockResolvedValueOnce(OVERVIEW);
    vi.spyOn(GuildService, "guildControllerGetBoardV1").mockResolvedValue(
      BOARD,
    );
    vi.spyOn(GuildService, "guildControllerGetRewardsV1").mockResolvedValue(
      REWARDS,
    );
    vi.spyOn(GuildService, "guildControllerGetPassportV1").mockResolvedValue(
      PASSPORT,
    );

    renderView();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Overview failed");

    fireEvent.click(
      within(alert).getByRole("button", { name: "Tentar novamente" }),
    );

    expect(await screen.findByText("Nº 0047")).toBeInTheDocument();
    expect(overview).toHaveBeenCalledTimes(4);
  });

  it("renders GuildActiveContracts compact summary, ready badge, localized elapsed time, target link, and manage button", async () => {
    const readyContract = {
      ...ACCEPTED_CONTRACT,
      id: "contract-ready",
      status: GuildContractDto.status.READY_TO_CLAIM,
      acceptedAt: new Date(Date.now() - 5 * DAY_MS).toISOString(),
      playtimeProgress: {
        playedSeconds: 7200,
        estimatedTotalSeconds: 36000,
        estimatedPercent: 20,
      },
    } as unknown as GuildContractDto;

    mockGuildApi({
      overview: {
        ...OVERVIEW,
        activeContracts: [readyContract],
        counts: { boardCount: 1, acceptedCount: 1, completedCount: 0 },
      } as unknown as GuildOverviewResponseDto,
    });

    renderView();

    expect(await screen.findByText("1 / 3 ativos")).toBeInTheDocument();
    expect(screen.getByText("1 pronto para entregar")).toBeInTheDocument();
    expect(screen.getByText(/Aceito há 5 dias/)).toBeInTheDocument();

    const gameLink = screen.getByRole("link", { name: "Hollow Knight" });
    expect(gameLink).toHaveAttribute("href", "/game/1029");

    fireEvent.click(
      screen.getByRole("button", { name: "Gerenciar contratos" }),
    );

    expect(await screen.findByTestId("guild-contract-list")).toHaveAttribute(
      "data-tab",
      "accepted",
    );
  });
});

describe("Guild Hall navigation", () => {
  it("greets the Community Bounty and opens Bounties from Lina's first option", async () => {
    mockGuildApi({ overview: BOUNTY_READY_OVERVIEW });

    renderView();

    await screen.findByText("Nº 0047");

    expect(screen.getByTestId("lina-line").textContent).toContain(
      "Desafio da Comunidade",
    );

    const dialogue = screen.getByTestId("lina-dialogue");
    const options = within(dialogue).getAllByRole("button");

    expect(options.map((btn) => btn.getAttribute("data-option"))).toEqual([
      "bounties",
      "board",
      "goodbye",
    ]);
    expect(options[0]).toHaveTextContent("Me mostra o desafio da comunidade");

    const bountiesTab = screen.getByRole("tab", { name: /Desafios/ });
    expect(bountiesTab.querySelector("[data-bounty-marker]")).toHaveAttribute(
      "data-bounty-marker",
      "ready",
    );

    fireEvent.click(options[0]);

    expect(await screen.findByTestId("guild-bounties")).toBeInTheDocument();
    expect(bountiesTab).toHaveAttribute("aria-selected", "true");
  });

  it("opens the Emporium from Lina's option", async () => {
    mockGuildApi();

    renderView();

    await screen.findByText("Nº 0047");

    fireEvent.click(
      screen.getByRole("button", { name: "Me mostra o Empório" }),
    );

    expect(await screen.findByTestId("guild-emporium")).toBeInTheDocument();
  });

  it("shows the weekly board countdown only on the tabs that follow the board", async () => {
    mockGuildApi();

    renderView();

    await screen.findByText("Nº 0047");

    const countdown = document.querySelector("[data-tabs-renew]");
    expect(countdown).toHaveAttribute("data-tabs-renew", "shown");
    expect(countdown).toHaveTextContent("Renova em");

    fireEvent.click(screen.getByRole("tab", { name: /Empório/ }));

    expect(await screen.findByTestId("guild-emporium")).toBeInTheDocument();
    const hiddenCountdown = document.querySelector("[data-tabs-renew]");
    expect(hiddenCountdown).toHaveAttribute("data-tabs-renew", "hidden");
    // The reserved row is empty: no hourglass and no countdown copy.
    expect(hiddenCountdown?.querySelector("img")).toBeNull();
    expect(hiddenCountdown?.textContent).toBe("");

    fireEvent.click(screen.getByRole("tab", { name: /Aceitos/ }));

    await waitFor(() =>
      expect(document.querySelector("[data-tabs-renew]")).toHaveAttribute(
        "data-tabs-renew",
        "shown",
      ),
    );
    expect(
      within(countdown as HTMLElement).getByText(/Renova em/),
    ).toBeInTheDocument();
  });

  it("opens the arcs, bounties and emporium tabs from the initial tab", async () => {
    const api = mockGuildApi();

    renderView({ initialTab: "arcs" });

    expect(await screen.findByTestId("guild-chains")).toBeInTheDocument();

    cleanup();

    renderView({ initialTab: "bounties", bountyId: "bounty-1" });

    expect(await screen.findByTestId("guild-bounties")).toHaveAttribute(
      "data-bounty-id",
      "bounty-1",
    );

    cleanup();

    renderView({ initialTab: "emporium" });

    expect(await screen.findByTestId("guild-emporium")).toBeInTheDocument();
    expect(api.board).not.toHaveBeenCalled();
  });

  it("follows a tab and bounty deep link while the hall is already mounted", async () => {
    mockGuildApi();

    const client = createClient();
    const view = render(createTree(client, { initialTab: "arcs" }));

    expect(await screen.findByTestId("guild-chains")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Arcos/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    // Notification inbox navigation re-renders the same route with new props;
    // the hall must follow the link without remounting the scene.
    view.rerender(
      createTree(client, { initialTab: "bounties", bountyId: "bounty-9" }),
    );

    const bounties = await screen.findByTestId("guild-bounties");
    expect(screen.getByRole("tab", { name: /Desafios/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(bounties).toHaveAttribute("data-bounty-id", "bounty-9");

    const card = bounties.querySelector('[data-highlighted="true"]');
    expect(card).not.toBeNull();
    expect(card).toHaveAttribute("data-bounty-id", "bounty-9");
  });

  it("marks the Bounties tab while there are active bounties", async () => {
    mockGuildApi({ overview: ACTIVE_BOUNTIES_OVERVIEW });

    renderView();

    await screen.findByText("Nº 0047");

    const bountiesTab = screen.getByRole("tab", { name: /Desafios/ });
    expect(bountiesTab.querySelector("[data-bounty-marker]")).toHaveAttribute(
      "data-bounty-marker",
      "active",
    );

    const completedTab = screen.getByRole("tab", { name: /Concluídos/ });
    expect(completedTab.querySelector("[data-bounty-marker]")).toBeNull();
  });

  it("draws the equipped tavern decor on the scene", async () => {
    mockGuildApi({
      overview: {
        ...OVERVIEW,
        license: {
          ...OVERVIEW.license,
          equippedDecorKeys: ["decor_oak_barrel", "decor_compass_rose"],
        },
      } as unknown as GuildOverviewResponseDto,
    });

    renderView();

    expect(await screen.findByTestId("guild-scene")).toHaveAttribute(
      "data-decor",
      "decor_oak_barrel,decor_compass_rose",
    );
  });
});
