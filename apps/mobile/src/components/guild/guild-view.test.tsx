// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { type ReactNode } from "react";
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
  GuildRewardsResponseDto,
} from "@repo/wrapper/server";
import { GuildView } from "../../../../../packages/ui/src/components/guild/view/GuildView";
import type { GuildViewProps } from "../../../../../packages/ui/src/components/guild/view/GuildView";

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
      dialogue,
    }: {
      variant: string;
      pose: string;
      isTalking: boolean;
      showAlert: boolean;
      dialogue?: ReactNode;
    }) => (
      <div
        data-testid="guild-scene"
        data-variant={variant}
        data-pose={pose}
        data-alert={String(showAlert)}
        data-talking={String(isTalking)}
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
} as GuildRewardsResponseDto;

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
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function renderView(props: Partial<GuildViewProps> = {}) {
  const client = createClient();

  return render(
    <MantineProvider>
      <QueryClientProvider client={client}>
        <GuildView supporterHref="/premium" {...props} />
      </QueryClientProvider>
    </MantineProvider>,
  );
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

  return { access, overview, board, markSeen, accept, contracts, rewards };
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
});

describe("Guild Hall", () => {
  it("renders the license scenario, the recommended quest and the Lina options", async () => {
    const api = mockGuildApi();

    renderView();

    expect(await screen.findByText("Nº 0047")).toBeInTheDocument();
    expect(api.access).toHaveBeenCalledTimes(1);
    expect(api.overview).toHaveBeenCalled();
    expect(api.board).toHaveBeenCalledWith(undefined);

    // Header: pt-BR XP formatting and rank badge.
    expect(screen.getByText("1.240 / 2.000 XP")).toBeInTheDocument();
    expect(screen.getByText("RANK C")).toBeInTheDocument();

    // License card.
    expect(screen.getByText("Próximo rank: B")).toBeInTheDocument();
    expect(screen.getByText("faltam 760 XP")).toBeInTheDocument();
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

  it("opens the requested initial tab for notification deep-links", async () => {
    const api = mockGuildApi();

    renderView({ initialTab: "accepted" });

    expect(await screen.findByTestId("guild-contract-list")).toHaveAttribute(
      "data-tab",
      "accepted",
    );
    expect(api.board).not.toHaveBeenCalled();
  });

  it("re-reads the board with quick=true and offers a way back", async () => {
    const api = mockGuildApi();

    renderView();

    await screen.findByText("Relíquia Esquecida");

    fireEvent.click(
      screen.getByRole("button", { name: "Tem algum pedido mais rápido?" }),
    );

    await waitFor(() => expect(api.board).toHaveBeenCalledWith(true));
    expect(screen.getByText("Pedidos rápidos")).toBeInTheDocument();

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

  it("shows a full bar and no next rank at rank S", async () => {
    mockGuildApi({ overview: RANK_S_OVERVIEW, board: EMPTY_BOARD });

    renderView();

    expect(
      await screen.findByText("Rank máximo alcançado"),
    ).toBeInTheDocument();
    expect(screen.getByText("7.500 XP")).toBeInTheDocument();
    expect(screen.queryByText(/Próximo rank:/)).toBeNull();

    const bars = screen.getAllByRole("progressbar");
    expect(bars.length).toBeGreaterThanOrEqual(2);
    for (const bar of bars) {
      expect(bar).toHaveAttribute("aria-valuenow", "100");
    }
  });
});
