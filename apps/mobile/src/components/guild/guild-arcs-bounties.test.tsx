// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nProvider } from "@repo/locales";
import {
  CollectionsEntriesService,
  GameRepositoryService,
  GuildService,
  type CancelablePromise,
  type ClaimGuildBountyResponseDto,
  type Game,
  type GuildAccessResponseDto,
  type GuildBountiesResponseDto,
  type GuildBountyDto,
  type GuildChainDto,
  type GuildChainsResponseDto,
} from "@repo/wrapper/server";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GuildBounties } from "../../../../../packages/ui/src/components/guild/view/GuildBounties";
import { GuildChains } from "../../../../../packages/ui/src/components/guild/view/GuildChains";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";
import type { LinkComponentProps } from "../../../../../packages/ui/src/util/link";
import type { ModalComponentProps } from "../../../../../packages/ui/src/util/modal";

const session = vi.hoisted(() => ({
  userId: "user-1" as string | undefined,
}));

vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => session.userId }),
);

vi.mock(
  "../../../../../packages/ui/src/components/auth/authClient",
  () => ({
    authClient: {
      useSession: () => ({
        data: session.userId ? { user: { id: session.userId } } : null,
        isPending: false,
      }),
    },
  }),
);

vi.mock("@mantine/notifications", () => ({
  notifications: { show: vi.fn() },
}));

/**
 * The production modal searches the whole IGDB catalog and needs its own query
 * stack; the Guild only cares that a game id comes back.
 */
vi.mock(
  "../../../../../packages/ui/src/components/game/search/modal/GameSearchSelectModal",
  () => ({
    GameSearchSelectModal: ({
      opened,
      onSelected,
    }: {
      opened: boolean;
      onSelected: (gameId: number) => void;
    }) =>
      opened ? (
        <div data-testid="game-search-modal">
          <button type="button" onClick={() => onSelected(1029)}>
            Celeste (1029)
          </button>
        </div>
      ) : null,
  }),
);

const router = {
  pathname: "/guild",
  asPath: "/guild",
  back: () => {},
  push: vi.fn(async () => {}),
  query: new URLSearchParams(),
};

function TestLink({ href, children, ...props }: LinkComponentProps) {
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}

function TestModal({ opened, onClose, title, children }: ModalComponentProps) {
  if (!opened) {
    return null;
  }

  return (
    <div role="dialog" aria-label={title ?? undefined}>
      {title ? <span>{title}</span> : null}
      <button type="button" onClick={onClose}>
        close
      </button>
      {children}
    </div>
  );
}

function createClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, retryDelay: 0 },
      mutations: { retry: false },
    },
  });
}

function renderScreen(ui: ReactElement) {
  return render(
    <I18nProvider language="pt-BR">
      <MantineProvider>
        <QueryClientProvider client={createClient()}>
          <UIProvider
            presenters={{ Link: TestLink, Modal: TestModal }}
            hooks={{ useRouter: () => router }}
          >
            {ui}
          </UIProvider>
        </QueryClientProvider>
      </MantineProvider>
    </I18nProvider>,
  );
}

const ACCESS = {
  mode: "supporters",
  hasAccess: true,
} as GuildAccessResponseDto;

const DAY_MS = 24 * 60 * 60 * 1000;

function daysFromNow(days: number): string {
  return new Date(Date.now() + days * DAY_MS).toISOString();
}

function chainStage(
  index: number,
  stageKey: string,
  overrides: Record<string, unknown> = {},
): GuildChainDto["stages"][number] {
  return {
    index,
    stageKey,
    objectiveType: "finish_game",
    targetCount: 1,
    criteria: {},
    xpReward: 100,
    sealsReward: 15,
    durationDays: 21,
    usesBoundTargetGame: false,
    ...overrides,
  } as unknown as GuildChainDto["stages"][number];
}

const PATHFINDER_STAGES = [
  chainStage(0, "trail_head", {
    objectiveType: "log_playtime",
    targetCount: 120,
    usesBoundTargetGame: true,
  }),
  chainStage(1, "summit_push", {
    xpReward: 180,
    sealsReward: 25,
    usesBoundTargetGame: true,
  }),
  chainStage(2, "field_notes", {
    objectiveType: "write_review",
    xpReward: 260,
    sealsReward: 35,
    usesBoundTargetGame: true,
  }),
];

const RELIC_STAGES = [
  chainStage(0, "relic_triage", {
    objectiveType: "triage_backlog",
    targetCount: 3,
    xpReward: 160,
    sealsReward: 25,
    durationDays: 14,
  }),
  chainStage(1, "relic_finish", {
    xpReward: 280,
    sealsReward: 45,
    durationDays: 30,
  }),
  chainStage(2, "relic_chronicle", {
    objectiveType: "write_review",
    targetCount: 2,
    xpReward: 340,
    sealsReward: 60,
  }),
];

const CURATOR_STAGES = [
  chainStage(0, "first_exhibit", {
    objectiveType: "curate_collection",
    xpReward: 120,
    sealsReward: 20,
    durationDays: 14,
  }),
  chainStage(1, "curated_finish", {
    xpReward: 200,
    sealsReward: 30,
  }),
  chainStage(2, "curators_essay", {
    objectiveType: "publish_post",
    xpReward: 260,
    sealsReward: 40,
    durationDays: 14,
  }),
];

function chain(overrides: Record<string, unknown>): GuildChainDto {
  return {
    chainKey: "pathfinders_arc",
    titleKey: "guild_chain_pathfinders_arc_title",
    minRank: "E",
    status: "available",
    currentStageIndex: 0,
    totalStages: 3,
    boundTargetGameId: null,
    boundGame: null,
    activeContractId: null,
    stages: PATHFINDER_STAGES,
    finalRewards: [
      {
        id: "reward-pathfinder",
        key: "title_pathfinder",
        kind: "title",
        achievementId: null,
        inChestPool: false,
        chestBonusXp: 0,
        chestBonusSeals: 0,
        rarity: "rare",
        consumableKey: null,
      },
      {
        id: "reward-compass",
        key: "decor_compass_rose",
        kind: "tavern_decor",
        achievementId: null,
        inChestPool: false,
        chestBonusXp: 0,
        chestBonusSeals: 0,
        rarity: "epic",
        consumableKey: null,
      },
    ],
    finalBonusSeals: 100,
    ...overrides,
  } as unknown as GuildChainDto;
}

const PATHFINDERS_AVAILABLE = chain({});

const RELIC_LOCKED = chain({
  chainKey: "relic_hunters_arc",
  titleKey: "guild_chain_relic_hunters_arc_title",
  minRank: "C",
  status: "locked",
  stages: RELIC_STAGES,
  finalRewards: [
    {
      id: "reward-relic-warden",
      key: "title_relic_warden",
      kind: "title",
      achievementId: null,
      inChestPool: false,
      chestBonusXp: 0,
      chestBonusSeals: 0,
      rarity: "legendary",
      consumableKey: null,
    },
    {
      id: "reward-relic-plinth",
      key: "decor_relic_plinth",
      kind: "tavern_decor",
      achievementId: null,
      inChestPool: false,
      chestBonusXp: 0,
      chestBonusSeals: 0,
      rarity: "legendary",
      consumableKey: null,
    },
  ],
  finalBonusSeals: 200,
});

const CURATORS_AVAILABLE = chain({
  chainKey: "curators_arc",
  titleKey: "guild_chain_curators_arc_title",
  minRank: "D",
  stages: CURATOR_STAGES,
  finalRewards: [
    {
      id: "reward-curator-prime",
      key: "title_curator_prime",
      kind: "title",
      achievementId: null,
      inChestPool: false,
      chestBonusXp: 0,
      chestBonusSeals: 0,
      rarity: "epic",
      consumableKey: null,
    },
    {
      id: "reward-curators-shelf",
      key: "decor_curators_shelf",
      kind: "tavern_decor",
      achievementId: null,
      inChestPool: false,
      chestBonusXp: 0,
      chestBonusSeals: 0,
      rarity: "rare",
      consumableKey: null,
    },
  ],
  finalBonusSeals: 120,
});

const CELESTE = {
  gameId: 1029,
  name: "Celeste",
  slug: "celeste",
  coverUrl: null,
};

const PATHFINDERS_ACTIVE = chain({
  status: "in_progress",
  currentStageIndex: 1,
  boundTargetGameId: 1029,
  boundGame: CELESTE,
  activeContractId: "contract-1",
});

const PATHFINDERS_ADVANCE = chain({
  status: "in_progress",
  currentStageIndex: 1,
  boundTargetGameId: 1029,
  boundGame: CELESTE,
  activeContractId: null,
});

const PATHFINDERS_COMPLETED = chain({
  status: "completed",
  currentStageIndex: 2,
  boundTargetGameId: 1029,
  boundGame: CELESTE,
  ...{ completedAt: "2026-11-20T12:00:00.000Z" },
});

function milestone(
  value: number,
  overrides: Record<string, unknown> = {},
): GuildBountyDto["milestones"][number] {
  return {
    milestone: value,
    unlocked: false,
    claimed: false,
    claimable: false,
    sealsReward: 0,
    xpReward: 0,
    rewardId: null,
    chestKind: null,
    ...overrides,
  } as unknown as GuildBountyDto["milestones"][number];
}

const BOUNTY = {
  id: "bounty-1",
  slug: "spooky-october-2026",
  title: "Outubro Assombrado",
  description: "Finalize um jogo de terror neste mês.",
  objectiveType: "finish_game",
  targetTotal: 500,
  currentTotal: 320,
  progressPercent: 64,
  startsAt: daysFromNow(-20),
  endsAt: daysFromNow(5),
  status: "published",
  userContribution: 2,
  minUserContribution: 1,
  eligible: true,
  claimedMilestones: [25],
  milestones: [
    milestone(25, { unlocked: true, claimed: true, sealsReward: 25 }),
    milestone(50, { unlocked: true, claimable: true, sealsReward: 50 }),
    milestone(100, { sealsReward: 100, chestKind: "chest_gold" }),
    milestone(150),
  ],
  hasClaimableMilestones: true,
} as unknown as GuildBountyDto;

const BOUNTY_INELIGIBLE = {
  ...BOUNTY,
  id: "bounty-2",
  slug: "spooky-october-2026-b",
  title: "Outubro Assombrado II",
  userContribution: 0,
  eligible: false,
  claimedMilestones: [],
  milestones: [
    milestone(25, { unlocked: true, sealsReward: 25 }),
    milestone(50, { sealsReward: 50 }),
    milestone(100, { sealsReward: 100 }),
    milestone(150),
  ],
  hasClaimableMilestones: false,
} as unknown as GuildBountyDto;

const CLAIM_RESPONSE = {
  bountyId: "bounty-1",
  claimedMilestones: [25, 50],
  newlyClaimedMilestones: [50],
  sealsAwarded: 50,
  xpAwarded: 125,
  globalXpAwarded: 31,
  rankBefore: "C",
  rankAfter: "C",
  unlockedRewards: [],
  chestResults: [
    {
      chestKind: "chest_gold",
      bonusXp: 125,
      bonusSeals: 60,
      unlockedCosmetic: null,
      grantedConsumable: null,
    },
  ],
} as unknown as ClaimGuildBountyResponseDto;

let currentChains: GuildChainsResponseDto;
let currentBounties: GuildBountiesResponseDto;
let scrollSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  session.userId = "user-1";
  currentChains = { chains: [PATHFINDERS_AVAILABLE] };
  currentBounties = { bounties: [BOUNTY] };
  scrollSpy = vi.fn();

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
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );

  Element.prototype.scrollIntoView =
    scrollSpy as unknown as typeof Element.prototype.scrollIntoView;
  // Other suites stub the HTMLElement prototype (which shadows Element's), so
  // the spy has to win at the closest prototype for these elements.
  HTMLElement.prototype.scrollIntoView =
    scrollSpy as unknown as typeof HTMLElement.prototype.scrollIntoView;

  vi.spyOn(GuildService, "guildControllerGetAccessV1").mockResolvedValue(
    ACCESS,
  );
  vi.spyOn(GuildService, "guildControllerListChainsV1").mockImplementation(
    () =>
      Promise.resolve(
        currentChains,
      ) as CancelablePromise<GuildChainsResponseDto>,
  );
  vi.spyOn(GuildService, "guildControllerListBountiesV1").mockImplementation(
    () =>
      Promise.resolve(
        currentBounties,
      ) as CancelablePromise<GuildBountiesResponseDto>,
  );
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  delete (Element.prototype as { scrollIntoView?: unknown }).scrollIntoView;
  delete (HTMLElement.prototype as { scrollIntoView?: unknown }).scrollIntoView;
  session.userId = "user-1";
});

describe("GuildChains", () => {
  it("starts Pathfinder's Arc with the picked game and opens the Accepted tab", async () => {
    const onShowAccepted = vi.fn();
    const start = vi
      .spyOn(GuildService, "guildControllerStartChainV1")
      .mockResolvedValue({
        chain: PATHFINDERS_ACTIVE,
        contractId: "contract-1",
      } as unknown as Awaited<
        ReturnType<typeof GuildService.guildControllerStartChainV1>
      >);

    renderScreen(<GuildChains onShowAccepted={onShowAccepted} />);

    expect(
      await screen.findByText("O Arco do Desbravador"),
    ).toBeInTheDocument();
    expect(
      within(
        document.querySelector<HTMLElement>('[data-stage-index="0"]')!,
      ).getByText("Início da Trilha"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("+100 XP · +15 Selos · 21 dias"),
    ).toBeInTheDocument();
    expect(screen.getByText("+100 Selos ao concluir")).toBeInTheDocument();
    expect(screen.getByText("Desbravador")).toBeInTheDocument();
    expect(screen.getByText("Rosa dos Ventos")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Começar" }));

    const picker = await screen.findByTestId("game-search-modal");
    fireEvent.click(
      within(picker).getByRole("button", { name: "Celeste (1029)" }),
    );

    await waitFor(() =>
      expect(start).toHaveBeenCalledWith("pathfinders_arc", {
        targetGameId: 1029,
      }),
    );
    await waitFor(() => expect(onShowAccepted).toHaveBeenCalledTimes(1));
  });

  it("starts an arc that does not need a bound game without targetGameId", async () => {
    currentChains = { chains: [CURATORS_AVAILABLE] };
    const onShowAccepted = vi.fn();
    const start = vi
      .spyOn(GuildService, "guildControllerStartChainV1")
      .mockResolvedValue({
        chain: {
          ...CURATORS_AVAILABLE,
          status: "in_progress",
          activeContractId: "contract-curator",
        },
        contractId: "contract-curator",
      } as unknown as Awaited<
        ReturnType<typeof GuildService.guildControllerStartChainV1>
      >);

    renderScreen(<GuildChains onShowAccepted={onShowAccepted} />);

    expect(await screen.findByText("O Arco do Curador")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Começar" }));

    await waitFor(() => expect(start).toHaveBeenCalledWith("curators_arc", {}));
    expect(screen.queryByTestId("game-search-modal")).toBeNull();
    await waitFor(() => expect(onShowAccepted).toHaveBeenCalledTimes(1));
  });

  it("previews a locked arc and disables the action with its required rank", async () => {
    currentChains = { chains: [RELIC_LOCKED] };
    renderScreen(<GuildChains />);

    expect(
      await screen.findByText("O Arco do Caçador de Relíquias"),
    ).toBeInTheDocument();
    for (const [index, title] of [
      [0, "Triagem de Relíquias"],
      [1, "Recuperação da Relíquia"],
      [2, "Crônica da Relíquia"],
    ] as const) {
      expect(
        within(
          document.querySelector<HTMLElement>(`[data-stage-index="${index}"]`)!,
        ).getByText(title),
      ).toBeInTheDocument();
    }
    expect(
      screen.getByText("Faça a triagem de 3 jogos parados no backlog."),
    ).toBeInTheDocument();

    const action = screen.getByRole("button", {
      name: "Desbloqueia no Rank C",
    });
    expect(action).toBeDisabled();
    expect(
      document.querySelector('[data-chain-status="locked"]'),
    ).not.toBeNull();
  });

  it("links an in-progress chain with an active contract to the Accepted tab and renders a clickable target game link", async () => {
    currentChains = {
      chains: [
        {
          ...PATHFINDERS_ACTIVE,
          boundGame: {
            ...CELESTE,
            coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_small/celeste.jpg",
          },
        },
      ],
    };
    const onShowAccepted = vi.fn();
    const advance = vi.spyOn(GuildService, "guildControllerAdvanceChainV1");

    renderScreen(<GuildChains onShowAccepted={onShowAccepted} />);

    const gameLink = await screen.findByRole("link", {
      name: "Jogo escolhido: Celeste",
    });
    expect(gameLink).toHaveAttribute("href", "/game/1029");
    const cover = gameLink.querySelector("img");
    expect(cover).toHaveAttribute("width", "20");
    expect(cover).toHaveAttribute("height", "27");
    expect(cover?.style.imageRendering).not.toBe("pixelated");

    expect(
      screen.getByText("+180 XP · +25 Selos · 21 dias"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Ver contrato" }));

    expect(onShowAccepted).toHaveBeenCalledTimes(1);
    expect(advance).not.toHaveBeenCalled();
  });

  it("shows a library-first game picker with search and fallback to full search", async () => {
    const start = vi
      .spyOn(GuildService, "guildControllerStartChainV1")
      .mockResolvedValue({
        chain: PATHFINDERS_ACTIVE,
        contractId: "contract-1",
      } as unknown as Awaited<
        ReturnType<typeof GuildService.guildControllerStartChainV1>
      >);

    vi.spyOn(
      CollectionsEntriesService,
      "collectionsEntriesControllerFindAllByLibraryIdV1",
    ).mockResolvedValue({
      data: [
        { id: "entry-1", gameId: 42 },
        { id: "entry-2", gameId: 77 },
      ],
      pagination: { totalItems: 2, totalPages: 1 },
    } as unknown as Awaited<
      ReturnType<
        typeof CollectionsEntriesService.collectionsEntriesControllerFindAllByLibraryIdV1
      >
    >);

    vi.spyOn(
      GameRepositoryService,
      "gameRepositoryControllerFindAllByIdsV1",
    ).mockResolvedValue([
      {
        id: 42,
        name: "Hollow Knight",
        cover: {
          url: "https://images.igdb.com/igdb/image/upload/t_cover_small/hk.jpg",
        },
      },
      {
        id: 77,
        name: "Hades",
        cover: {
          url: "https://images.igdb.com/igdb/image/upload/t_cover_small/hades.jpg",
        },
      },
    ] as unknown as Game[]);

    renderScreen(<GuildChains />);

    expect(
      await screen.findByText("O Arco do Desbravador"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Começar" }));

    const dialog = await screen.findByRole("dialog", {
      name: "Escolher um jogo",
    });
    expect(
      within(dialog).getByText("Mostrando jogos da sua biblioteca primeiro."),
    ).toBeInTheDocument();
    expect(
      within(dialog).getAllByText("Na sua biblioteca"),
    ).toHaveLength(2);

    fireEvent.change(within(dialog).getByRole("searchbox"), {
      target: { value: "Hollow" },
    });
    expect(within(dialog).getByText("Hollow Knight")).toBeInTheDocument();
    expect(within(dialog).queryByText("Hades")).toBeNull();

    fireEvent.click(
      within(dialog).getByRole("button", { name: /Hollow Knight/ }),
    );

    await waitFor(() =>
      expect(start).toHaveBeenCalledWith("pathfinders_arc", {
        targetGameId: 42,
      }),
    );

    // Fallback to full IGDB search from the library picker modal.
    fireEvent.click(screen.getByRole("button", { name: "Começar" }));
    const reopened = await screen.findByRole("dialog", {
      name: "Escolher um jogo",
    });
    fireEvent.click(
      within(reopened).getByRole("button", { name: "Buscar jogos" }),
    );
    expect(await screen.findByTestId("game-search-modal")).toBeInTheDocument();
  });

  it("renders a retryable error state when loading chains fails", async () => {
    let shouldFail = true;
    const chainsSpy = vi
      .spyOn(GuildService, "guildControllerListChainsV1")
      .mockImplementation(() => {
        if (shouldFail) {
          return Promise.reject(
            new Error("Chains unavailable"),
          ) as CancelablePromise<GuildChainsResponseDto>;
        }
        return Promise.resolve(
          currentChains,
        ) as CancelablePromise<GuildChainsResponseDto>;
      });

    renderScreen(<GuildChains />);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Chains unavailable");

    const callsBeforeRetry = chainsSpy.mock.calls.length;
    shouldFail = false;
    fireEvent.click(
      within(alert).getByRole("button", { name: "Tentar novamente" }),
    );

    expect(
      await screen.findByText("O Arco do Desbravador"),
    ).toBeInTheDocument();
    expect(chainsSpy.mock.calls.length).toBeGreaterThan(callsBeforeRetry);
  });

  it("advances an in-progress chain without an active contract", async () => {
    currentChains = { chains: [PATHFINDERS_ADVANCE] };
    const onShowAccepted = vi.fn();
    const advance = vi
      .spyOn(GuildService, "guildControllerAdvanceChainV1")
      .mockResolvedValue({
        chain: PATHFINDERS_ACTIVE,
        contractId: "contract-2",
      } as unknown as Awaited<
        ReturnType<typeof GuildService.guildControllerAdvanceChainV1>
      >);

    renderScreen(<GuildChains onShowAccepted={onShowAccepted} />);

    const action = await screen.findByRole("button", {
      name: "Começar próxima etapa",
    });
    fireEvent.click(action);

    await waitFor(() =>
      expect(advance).toHaveBeenCalledWith("pathfinders_arc", {}),
    );
    await waitFor(() => expect(onShowAccepted).toHaveBeenCalledTimes(1));
  });

  it("shows the completion stamp and date for a completed arc", async () => {
    currentChains = { chains: [PATHFINDERS_COMPLETED] };

    renderScreen(<GuildChains />);

    const stamp = await screen.findByText("Arco concluído");
    expect(stamp).toBeInTheDocument();
    const completedDate = document.querySelector("[data-completed-date]");
    expect(completedDate).not.toBeNull();
    expect(completedDate).toHaveTextContent(/2026/);
    expect(document.querySelector('[data-chain-action="start"]')).toBeNull();
    expect(document.querySelector('[data-chain-action="advance"]')).toBeNull();
  });
});

describe("GuildBounties", () => {
  it("claims every claimable milestone and lists the new milestone with its Seals", async () => {
    const claim = vi
      .spyOn(GuildService, "guildControllerClaimBountyV1")
      .mockResolvedValue(CLAIM_RESPONSE);

    renderScreen(<GuildBounties />);

    expect(await screen.findByText("Outubro Assombrado")).toBeInTheDocument();
    expect(screen.getByText("320 / 500")).toBeInTheDocument();
    expect(screen.getByText(/Sua contribuição: 2/)).toBeInTheDocument();
    expect(screen.getByText(/Contribuição mínima: 1/)).toBeInTheDocument();

    const marker = (value: number) =>
      document.querySelector<HTMLElement>(`[data-progress-marker="${value}"]`);
    expect(marker(25)).toHaveAttribute("data-reached", "true");
    expect(marker(50)).toHaveAttribute("data-reached", "true");
    expect(marker(100)).toHaveAttribute("data-reached", "false");
    expect(marker(150)).toHaveAttribute("data-reached", "false");
    expect(screen.getByText("Excedente")).toBeInTheDocument();

    const claimedChip = document.querySelector<HTMLElement>(
      '[data-milestone="25"]',
    );
    expect(claimedChip).toHaveAttribute("data-state", "claimed");
    expect(
      within(claimedChip as HTMLElement).getByText("Resgatado"),
    ).toBeInTheDocument();

    const claimableChip = document.querySelector<HTMLElement>(
      '[data-milestone="50"]',
    );
    expect(claimableChip).toHaveAttribute("data-state", "claimable");

    fireEvent.click(
      screen.getByRole("button", { name: "Resgatar recompensas" }),
    );

    await waitFor(() => expect(claim).toHaveBeenCalledWith("bounty-1"));

    const modal = await screen.findByRole("dialog", {
      name: "Recompensas resgatadas",
    });
    const resultMilestone = modal.querySelector<HTMLElement>(
      '[data-milestone="50"]',
    );
    expect(resultMilestone).not.toBeNull();
    expect(
      within(resultMilestone as HTMLElement).getByText("+50 Selos"),
    ).toBeInTheDocument();
    expect(within(modal).getByText("Baú de Ouro")).toBeInTheDocument();
    expect(
      within(modal).getByText("Bônus do baú: +125 XP"),
    ).toBeInTheDocument();
  });

  it("shows a chest-unlocked frame with its art once, not again in the rewards list", async () => {
    const frame = {
      id: "reward-frame",
      kind: "avatar_frame",
      key: "frame_ruby_sigil",
      rarity: "epic",
      consumableKey: null,
    };
    const otherFrame = {
      id: "reward-frame-2",
      kind: "avatar_frame",
      key: "frame_lantern_glow",
      rarity: "rare",
      consumableKey: null,
    };

    vi.spyOn(GuildService, "guildControllerClaimBountyV1").mockResolvedValue({
      ...CLAIM_RESPONSE,
      unlockedRewards: [frame, otherFrame],
      chestResults: [
        {
          chestKind: "chest_gold",
          bonusXp: 125,
          bonusSeals: 60,
          unlockedCosmetic: frame,
          grantedConsumable: null,
        },
      ],
    } as unknown as ClaimGuildBountyResponseDto);

    renderScreen(<GuildBounties />);

    await screen.findByText("Outubro Assombrado");
    fireEvent.click(
      screen.getByRole("button", { name: "Resgatar recompensas" }),
    );

    const modal = await screen.findByRole("dialog", {
      name: "Recompensas resgatadas",
    });

    // The frame appears once, in the chest block, with the real frame art.
    expect(
      modal.querySelectorAll('[data-reward-key="frame_ruby_sigil"]'),
    ).toHaveLength(1);
    expect(
      modal.querySelector('[data-result-reward="frame_ruby_sigil"]'),
    ).toBeNull();
    const chestFrame = modal.querySelector<HTMLElement>(
      '[data-reward-key="frame_ruby_sigil"]',
    );
    expect(
      chestFrame?.querySelector('[data-reward-art="avatar_frame"]'),
    ).not.toBeNull();
    expect(
      chestFrame?.querySelector('[data-reward-frame="frame_ruby_sigil"]'),
    ).not.toBeNull();

    // Other unlocked rewards stay listed, also with their own art.
    const listedFrame = modal.querySelector<HTMLElement>(
      '[data-result-reward="frame_lantern_glow"]',
    );
    expect(listedFrame).not.toBeNull();
    expect(
      listedFrame?.querySelector('[data-reward-art="avatar_frame"]'),
    ).not.toBeNull();
  });

  it("shows the claim window after the bounty ended", async () => {
    currentBounties = {
      bounties: [
        {
          ...BOUNTY,
          endsAt: daysFromNow(-2),
        } as GuildBountyDto,
      ],
    };

    renderScreen(<GuildBounties />);

    expect(
      await screen.findByText(/Janela de resgate até/),
    ).toBeInTheDocument();
  });

  it("tells ineligible users to contribute before claiming", async () => {
    currentBounties = { bounties: [BOUNTY_INELIGIBLE] };

    renderScreen(<GuildBounties />);

    expect(
      await screen.findByText("Contribua com este desafio antes de resgatar."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Resgatar recompensas" }),
    ).toBeNull();
  });

  it("scrolls to and highlights the bounty from the notification deep link", async () => {
    currentBounties = { bounties: [BOUNTY, BOUNTY_INELIGIBLE] };

    renderScreen(<GuildBounties initialBountyId="bounty-2" />);

    expect(
      await screen.findByText("Outubro Assombrado II"),
    ).toBeInTheDocument();

    await waitFor(() => expect(scrollSpy).toHaveBeenCalled());

    expect(
      document.querySelector('[data-bounty-id="bounty-2"]'),
    ).toHaveAttribute("data-highlighted", "true");
    expect(
      document.querySelector('[data-bounty-id="bounty-1"]'),
    ).not.toHaveAttribute("data-highlighted");
  });

  it("shows the empty state when no bounty is published", async () => {
    currentBounties = { bounties: [] };

    renderScreen(<GuildBounties />);

    expect(
      await screen.findByText(/Nenhum Desafio da Comunidade agora/),
    ).toBeInTheDocument();
  });

  it("renders a retryable error state when loading bounties fails", async () => {
    let shouldFail = true;
    const bountiesSpy = vi
      .spyOn(GuildService, "guildControllerListBountiesV1")
      .mockImplementation(() => {
        if (shouldFail) {
          return Promise.reject(
            new Error("Bounties unavailable"),
          ) as CancelablePromise<GuildBountiesResponseDto>;
        }
        return Promise.resolve(
          currentBounties,
        ) as CancelablePromise<GuildBountiesResponseDto>;
      });

    renderScreen(<GuildBounties />);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Bounties unavailable");

    const callsBeforeRetry = bountiesSpy.mock.calls.length;
    shouldFail = false;
    fireEvent.click(
      within(alert).getByRole("button", { name: "Tentar novamente" }),
    );

    expect(await screen.findByText("Outubro Assombrado")).toBeInTheDocument();
    expect(bountiesSpy.mock.calls.length).toBeGreaterThan(callsBeforeRetry);
  });
});
