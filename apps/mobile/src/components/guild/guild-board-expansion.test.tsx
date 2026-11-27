// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { MantineProvider } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { I18nProvider } from "@repo/locales";
import {
  ApiError,
  GuildService,
  ProfileService,
  type CancelablePromise,
  type GuildAccessResponseDto,
  type GuildBoardQuestDto,
  type GuildBoardResponseDto,
  type GuildBoardBonusObjectiveDto,
  type GuildContractDto,
  type GuildOverviewResponseDto,
  type LinaReceptionDto,
  type ProfileResponseDto,
  type RerollGuildBoardEntryResponseDto,
} from "@repo/wrapper/server";
import type { ComponentProps, ReactElement, ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GuildAcceptedState } from "../../../../../packages/ui/src/components/guild/view/GuildAcceptedState";
import { GuildBoard } from "../../../../../packages/ui/src/components/guild/view/GuildBoard";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";
import type { ModalComponentProps } from "../../../../../packages/ui/src/util/modal";

const session = vi.hoisted(() => ({
  userId: "user-1" as string | undefined,
}));

vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => session.userId }),
);

vi.mock("@mantine/notifications", () => ({
  notifications: { show: vi.fn() },
}));

vi.mock(
  "../../../../../packages/ui/src/components/guild/scene/LinaSprite",
  () => ({
    LinaSprite: ({ pose, hop }: { pose: string; hop?: boolean }) => (
      <span
        data-testid="lina-sprite"
        data-pose={pose}
        data-hop={String(Boolean(hop))}
      />
    ),
  }),
);

vi.mock(
  "../../../../../packages/ui/src/components/guild/scene/LinaDialogue",
  () => ({
    LinaDialogue: ({
      segments,
      actions,
    }: {
      segments: { text: string }[];
      actions?: ReactNode;
    }) => (
      <div data-testid="lina-dialogue">
        {segments.map((segment, index) => (
          <span key={index}>{segment.text}</span>
        ))}
        {actions}
      </div>
    ),
  }),
);

const router = {
  pathname: "/guild",
  asPath: "/guild",
  back: () => {},
  push: vi.fn(async () => {}),
  query: new URLSearchParams(),
};

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

const MockLink = ({ children, ...props }: ComponentProps<"a">) => (
  <a {...props}>{children}</a>
);

function createClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, retryDelay: 0 },
      mutations: { retry: false },
    },
  });
}

function renderScreen(ui: ReactElement, language: "en" | "pt-BR" = "pt-BR") {
  return render(
    <I18nProvider language={language}>
      <MantineProvider>
        <QueryClientProvider client={createClient()}>
          <UIProvider
            presenters={{ Link: MockLink, Modal: TestModal }}
            hooks={{ useRouter: () => router }}
          >
            {ui}
          </UIProvider>
        </QueryClientProvider>
      </MantineProvider>
    </I18nProvider>,
  );
}

function renderBoard(
  language: "en" | "pt-BR" = "pt-BR",
  props: Partial<Parameters<typeof GuildBoard>[0]> = {},
) {
  return renderScreen(
    <GuildBoard
      quick={false}
      hiddenQuestIds={new Set()}
      onHideQuest={vi.fn()}
      onQuickChange={vi.fn()}
      onViewContracts={vi.fn()}
      {...props}
    />,
    language,
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

const BONUS: GuildBoardBonusObjectiveDto = {
  type: "finish_before_half_deadline" as GuildBoardBonusObjectiveDto.type,
  bonusSeals: 10,
};

function quest(
  overrides: Record<string, unknown> & {
    boardEntryId: string;
    templateKey: string;
    category: string;
  },
): GuildBoardQuestDto {
  return {
    sourceType: "board_entry",
    eventId: null,
    slug: null,
    cycle: "weekly",
    title: null,
    description: null,
    translations: [],
    rank: "D",
    xpReward: 150,
    sealsReward: 20,
    objectiveType: "play_distinct_days",
    targetCount: 4,
    criteria: {},
    candidateGames: [],
    meta: null,
    bonusObjective: null,
    rerollCount: 0,
    requiresTargetGame: false,
    reward: null,
    isRecommended: false,
    isQuick: false,
    contractDurationDays: 7,
    expiresAt: daysFromNow(3),
    ...overrides,
  } as unknown as GuildBoardQuestDto;
}

const CAMPAIGN_QUEST = quest({
  boardEntryId: "entry-1",
  templateKey: "campaign_rhythm",
  category: "weekly",
  xpReward: 150,
  sealsReward: 20,
  bonusObjective: BONUS,
});

const MONTHLY_QUEST = quest({
  boardEntryId: "monthly-1",
  templateKey: "the_colossus",
  category: "monthly",
  cycle: "monthly",
  rank: "A",
  xpReward: 750,
  sealsReward: 110,
  objectiveType: "finish_game",
  targetCount: 1,
  contractDurationDays: 45,
  expiresAt: "2026-12-01T03:00:00.000Z",
});

const UNKNOWN_QUEST = quest({
  boardEntryId: "entry-future",
  templateKey: "future_quest",
  category: "weekly",
  xpReward: 90,
  sealsReward: 0,
});

const REROLLED_QUEST = quest({
  boardEntryId: "entry-1",
  templateKey: "weekend_sprint",
  category: "weekly",
  xpReward: 160,
  sealsReward: 20,
  rerollCount: 1,
});

const BOARD: GuildBoardResponseDto = {
  weekStart: "2026-11-23",
  nextRefreshAt: daysFromNow(3),
  rerollsRemaining: 1,
  rerollChartersOwned: 0,
  monthlyExpeditionLocked: false,
  quests: [CAMPAIGN_QUEST, MONTHLY_QUEST],
} as GuildBoardResponseDto;

function overview(
  rank: string,
  maxActiveContracts: number,
): GuildOverviewResponseDto {
  return {
    license: {
      licenseNumber: 47,
      rank,
      xp: 1240,
      currentRankMinXp: 800,
      nextRank: "B",
      nextRankXp: 2000,
      xpToNextRank: 760,
      memberSince: "2026-01-04T12:00:00.000Z",
      equippedTitleKey: null,
      equippedFrameKey: null,
      perks: {
        maxActiveContracts,
        weeklyRerolls: 1,
        monthlyExpedition: true,
        monthlyExpeditionRankS: false,
        monthlyFreeHourglass: 0,
        legendaryContracts: false,
      },
      equippedDecorKeys: [],
      showcaseBadgeIds: [],
      stats: { finishedGames: 47, backlogGames: 23, reviewsCount: 12 },
    },
    activeContracts: [],
    yearGoal: null,
    counts: { boardCount: 2, acceptedCount: 0, completedCount: 0 },
    weekStart: "2026-11-23",
    nextRefreshAt: daysFromNow(3),
    lina: {
      trigger: "default",
      pose: "neutral",
      context: {},
      hasUnseenBoard: false,
    },
  } as unknown as GuildOverviewResponseDto;
}

let currentBoard: GuildBoardResponseDto;
let currentOverview: GuildOverviewResponseDto;

beforeEach(() => {
  session.userId = "user-1";
  currentBoard = BOARD;
  currentOverview = overview("C", 3);

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

  vi.spyOn(GuildService, "guildControllerGetAccessV1").mockResolvedValue(
    ACCESS,
  );
  vi.spyOn(GuildService, "guildControllerGetOverviewV1").mockImplementation(
    () =>
      Promise.resolve(
        currentOverview,
      ) as CancelablePromise<GuildOverviewResponseDto>,
  );
  vi.spyOn(GuildService, "guildControllerGetBoardV1").mockImplementation(
    () =>
      Promise.resolve(currentBoard) as CancelablePromise<GuildBoardResponseDto>,
  );
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  session.userId = "user-1";
});

function apiError(status: number, body: unknown): ApiError {
  return new ApiError(
    {} as unknown as ConstructorParameters<typeof ApiError>[0],
    { status, statusText: "", url: "/v1/guild/contracts", body, ok: false },
    "guild error",
  );
}

function getCard(boardEntryId: string): HTMLElement {
  const card = document.querySelector<HTMLElement>(
    `[data-quest-id="${boardEntryId}"]`,
  );
  if (!card) throw new Error(`missing quest card ${boardEntryId}`);
  return card;
}

describe("GuildBoard expansion", () => {
  it("shows the Seals reward and the optional bonus objective", async () => {
    renderBoard();

    await screen.findByText("Ritmo de Campanha");

    const card = getCard("entry-1");

    expect(within(card).getByText("+150 XP")).toBeInTheDocument();
    expect(within(card).getByText("+20 Selos")).toBeInTheDocument();
    expect(within(card).getByText("Bônus opcional")).toBeInTheDocument();
    expect(
      within(card).getByText("Finalize antes da metade do prazo"),
    ).toBeInTheDocument();
    expect(
      within(card).getByText(/Recompensa bônus: \+10 Selos/),
    ).toBeInTheDocument();
    // The bonus never blocks acceptance.
    expect(within(card).getByRole("button", { name: "Aceitar" })).toBeEnabled();
  });

  it("renders the Monthly Expedition first, full width, with accept-by and duration", async () => {
    renderBoard();

    await screen.findByText("O Colosso");

    const cards = document.querySelectorAll<HTMLElement>(
      "article[data-quest-id]",
    );
    expect(cards[0]).toHaveAttribute("data-quest-id", "monthly-1");
    expect(cards[0]).toHaveAttribute("data-monthly", "true");
    expect(cards[0].parentElement).toHaveAttribute("data-monthly", "true");

    const card = getCard("monthly-1");
    expect(within(card).getByText("Expedição Mensal")).toBeInTheDocument();
    expect(within(card).getByText(/Aceite até/)).toBeInTheDocument();
    expect(
      within(card).getByText("45 dias para concluir depois de aceitar"),
    ).toBeInTheDocument();
    expect(within(card).getByText("+110 Selos")).toBeInTheDocument();
    expect(
      within(card).queryByRole("button", { name: /Renov/ }),
    ).not.toBeInTheDocument();
  });

  it("shows the locked Monthly Expedition teaser first below Rank C", async () => {
    currentOverview = overview("E", 3);
    currentBoard = {
      ...BOARD,
      monthlyExpeditionLocked: true,
      rerollsRemaining: 0,
      rerollChartersOwned: 0,
      quests: [CAMPAIGN_QUEST],
    };

    renderBoard();

    await screen.findByText("Ritmo de Campanha");

    const teaser = document.querySelector<HTMLElement>(
      '[data-monthly-locked="true"]',
    );
    expect(teaser).not.toBeNull();

    const firstBoardChild = document.querySelector<HTMLElement>(
      "[data-board-grid='true']",
    )?.firstElementChild;
    expect(firstBoardChild).toBe(teaser);
    expect(firstBoardChild).toHaveAttribute("data-monthly-locked", "true");
    expect(
      within(teaser as HTMLElement).getAllByText("Expedição Mensal"),
    ).toHaveLength(2);
    expect(
      (teaser as HTMLElement).querySelector('[data-category="monthly"]'),
    ).not.toBeNull();
    expect(
      within(teaser as HTMLElement).getByText("Desbloqueia no Rank C"),
    ).toBeInTheDocument();
    expect(document.querySelector('[data-quest-id="monthly-1"]')).toBeNull();
    // Rank E with no rerolls left hides the reroll toolbar.
    expect(screen.queryByText(/renovações grátis/)).not.toBeInTheDocument();
  });

  it("rerolls the target entry and replaces the card in place", async () => {
    currentBoard = {
      ...BOARD,
      quests: [CAMPAIGN_QUEST],
      rerollsRemaining: 1,
    };

    const reroll = vi
      .spyOn(GuildService, "guildControllerRerollBoardEntryV1")
      .mockImplementation(() => {
        currentBoard = {
          ...currentBoard,
          rerollsRemaining: 0,
          rerollChartersOwned: 0,
          quests: [REROLLED_QUEST],
        };

        return Promise.resolve({
          quest: REROLLED_QUEST,
          rerollsRemaining: 0,
          rerollChartersOwned: 0,
          consumableUsed: null,
        }) as CancelablePromise<RerollGuildBoardEntryResponseDto>;
      });

    renderBoard();

    expect(await screen.findByText("Ritmo de Campanha")).toBeInTheDocument();
    expect(
      screen.getByText(/1 renovação grátis · 0 cartas/),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Renovação grátis/ }));

    await waitFor(() => expect(reroll).toHaveBeenCalledWith("entry-1"));

    await waitFor(() =>
      expect(screen.getByText("Corrida de Fim de Semana")).toBeInTheDocument(),
    );

    const card = getCard("entry-1");
    expect(
      within(card).getByText("Corrida de Fim de Semana"),
    ).toBeInTheDocument();
    expect(within(card).queryByText("Ritmo de Campanha")).toBeNull();
    expect(within(card).getByText("+160 XP")).toBeInTheDocument();
    expect(
      within(card).queryByRole("button", { name: /Renov/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/0 renovações grátis · 0 cartas/),
    ).toBeInTheDocument();
  });

  it("pluralizes the free rerolls and the charters independently", async () => {
    currentBoard = {
      ...BOARD,
      quests: [CAMPAIGN_QUEST],
      rerollsRemaining: 1,
      rerollChartersOwned: 1,
    };

    renderBoard("en");

    expect(
      await screen.findByText("1 free reroll · 1 charter"),
    ).toBeInTheDocument();

    cleanup();

    currentBoard = {
      ...BOARD,
      quests: [CAMPAIGN_QUEST],
      rerollsRemaining: 0,
      rerollChartersOwned: 2,
    };

    renderBoard("en");

    // Zero is plural in English and Portuguese, even where CLDR says "one".
    expect(
      await screen.findByText("0 free rerolls · 2 charters"),
    ).toBeInTheDocument();
  });

  it("keeps a card with an unknown template and a generic title", async () => {
    currentBoard = { ...BOARD, quests: [UNKNOWN_QUEST] };

    renderBoard();

    expect(await screen.findByText("future quest")).toBeInTheDocument();
    expect(getCard("entry-future")).toBeInTheDocument();
  });

  it("keeps an unknown bonus type with the generic bonus label", async () => {
    currentBoard = {
      ...BOARD,
      quests: [
        {
          ...CAMPAIGN_QUEST,
          bonusObjective: {
            type: "future_bonus",
          } as unknown as GuildBoardBonusObjectiveDto,
        },
      ],
    };

    renderBoard();

    await screen.findByText("Ritmo de Campanha");

    const card = getCard("entry-1");
    expect(within(card).getByText("Bônus opcional")).toBeInTheDocument();
    expect(within(card).getByRole("button", { name: "Aceitar" })).toBeEnabled();
  });

  it("shows the active-contract cap of the cached license on accept failure", async () => {
    currentOverview = overview("B", 4);
    currentBoard = { ...BOARD, quests: [CAMPAIGN_QUEST] };
    // The shared mutation handler logs translated business errors on purpose.
    vi.spyOn(console, "error").mockImplementation(() => {});

    vi.spyOn(GuildService, "guildControllerAcceptContractV1").mockRejectedValue(
      apiError(409, {
        message: "Active contract limit reached",
        code: "guild_active_contract_limit_reached",
      }),
    );

    renderBoard();

    await screen.findByText("Ritmo de Campanha");

    fireEvent.click(screen.getByRole("button", { name: "Aceitar" }));

    await waitFor(() =>
      expect(notifications.show).toHaveBeenCalledWith(
        expect.objectContaining({
          color: "red",
          message:
            "Você já tem 4 contratos ativos. Conclua ou abandone um antes de aceitar outro.",
        }),
      ),
    );
  });

  it("toggles quick quests from the board toolbar with aria-pressed", async () => {
    const onQuickChange = vi.fn();
    renderBoard("en", { quick: false, onQuickChange });

    await screen.findByText("Campaign Rhythm");

    const toggle = screen.getByRole("button", { name: "Quick quests" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(toggle);
    expect(onQuickChange).toHaveBeenCalledWith(true);
  });

  it("shows hidden quest reset controls and distinct all-hidden empty state", async () => {
    currentBoard = { ...BOARD, quests: [CAMPAIGN_QUEST] };
    const onRestoreHiddenQuests = vi.fn();

    renderBoard("en", {
      hiddenQuestIds: new Set(["entry-1"]),
      onRestoreHiddenQuests,
    });

    expect(
      await screen.findByText("You hid every quest on the board."),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/No quests on the board this week/),
    ).toBeNull();

    const restoreButtons = screen.getAllByRole("button", {
      name: "Show 1 hidden quest",
    });
    expect(restoreButtons.length).toBeGreaterThanOrEqual(1);

    fireEvent.click(restoreButtons[0]!);
    expect(onRestoreHiddenQuests).toHaveBeenCalledTimes(1);
  });

  it("blocks accept and shows cap banner when active contracts reach the cap", async () => {
    currentBoard = {
      ...BOARD,
      quests: [
        quest({
          boardEntryId: "entry-target",
          templateKey: "forgotten_relic",
          category: "library",
          requiresTargetGame: true,
          targetCount: 1,
          candidateGames: [
            {
              gameId: 1029,
              name: "Hollow Knight",
              slug: "hollow-knight",
              coverUrl: null,
              sinceYear: 2023,
            },
          ],
        }),
      ],
    };
    const accept = vi.spyOn(GuildService, "guildControllerAcceptContractV1");

    renderBoard("en", {
      activeContractsCount: 3,
      maxActiveContracts: 3,
    });

    expect(
      await screen.findByText(
        "3 / 3 active contracts — finish or abandon one to accept another.",
      ),
    ).toBeInTheDocument();

    const acceptButton = screen.getByRole("button", { name: "Accept" });
    expect(acceptButton).toBeDisabled();
    fireEvent.click(acceptButton);

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(accept).not.toHaveBeenCalled();
  });

  it("asks confirmation before spending a Reroll Charter and keeps sibling cards mounted", async () => {
    currentBoard = {
      ...BOARD,
      quests: [CAMPAIGN_QUEST, MONTHLY_QUEST],
      rerollsRemaining: 0,
      rerollChartersOwned: 2,
    };

    const reroll = vi
      .spyOn(GuildService, "guildControllerRerollBoardEntryV1")
      .mockImplementation(() => {
        currentBoard = {
          ...currentBoard,
          rerollsRemaining: 0,
          rerollChartersOwned: 1,
          quests: [REROLLED_QUEST, MONTHLY_QUEST],
        };

        return Promise.resolve({
          quest: REROLLED_QUEST,
          rerollsRemaining: 0,
          rerollChartersOwned: 1,
          consumableUsed: "reroll_charter",
        }) as CancelablePromise<RerollGuildBoardEntryResponseDto>;
      });

    renderBoard("en");

    await screen.findByText("Campaign Rhythm");
    const siblingCardBefore = getCard("monthly-1");

    fireEvent.click(screen.getByRole("button", { name: "Reroll with a charter" }));

    const dialog = await screen.findByRole("dialog", {
      name: "Spend a Reroll Charter?",
    });
    expect(
      within(dialog).getByText(
        'You have no free rerolls left. This spends 1 Reroll Charter (1 left after) to replace "Campaign Rhythm".',
      ),
    ).toBeInTheDocument();
    expect(reroll).not.toHaveBeenCalled();

    fireEvent.click(within(dialog).getByRole("button", { name: "Spend charter" }));

    await waitFor(() => expect(reroll).toHaveBeenCalledWith("entry-1"));
    await waitFor(() =>
      expect(screen.getByText("Weekend Sprint")).toBeInTheDocument(),
    );
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(getCard("monthly-1")).toBe(siblingCardBefore);
  });

  it("renders a retryable GuildQueryError when loading the board fails", async () => {
    const boardSpy = vi
      .spyOn(GuildService, "guildControllerGetBoardV1")
      .mockRejectedValueOnce(new Error("Board unavailable"))
      .mockRejectedValueOnce(new Error("Board unavailable"))
      .mockRejectedValueOnce(new Error("Board unavailable"))
      .mockResolvedValueOnce(BOARD);

    renderBoard("en");

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Board unavailable");

    fireEvent.click(within(alert).getByRole("button", { name: "Retry" }));

    expect(await screen.findByText("Campaign Rhythm")).toBeInTheDocument();
    expect(boardSpy).toHaveBeenCalledTimes(4);
  });
});

const ACCEPTED_CONTRACT = {
  id: "contract-seals",
  boardEntryId: "entry-1",
  eventId: null,
  category: "library",
  templateKey: "forgotten_relic",
  rank: "B",
  xpReward: 250,
  sealsReward: 35,
  objectiveType: "finish_game",
  criteria: {},
  bonusObjective: null,
  bonusCompleted: false,
  extendedCount: 0,
  chainProgressId: null,
  targetGameId: 1029,
  targetGame: {
    gameId: 1029,
    name: "Hollow Knight",
    slug: "hollow-knight",
    coverUrl: null,
  },
  progressCurrent: 0,
  progressTarget: 1,
  status: "active",
  playtimeProgress: null,
  reward: null,
  event: null,
  claimPayload: null,
  acceptedAt: daysFromNow(-1),
  readyAt: null,
  claimedAt: null,
  expiresAt: daysFromNow(20),
  createdAt: daysFromNow(-1),
  updatedAt: daysFromNow(-1),
} as unknown as GuildContractDto;

const ACCEPT_LINA = {
  trigger: "contract_accepted",
  pose: "happy",
  context: { targetGameName: "Hollow Knight" },
  hasUnseenBoard: false,
} as LinaReceptionDto;

describe("GuildAcceptedState coins", () => {
  it("shows the Seals reward next to the XP chip", async () => {
    vi.spyOn(
      ProfileService,
      "profileControllerFindOneByIdV1",
    ).mockResolvedValue({
      username: "cassi",
      guildTitleKey: null,
    } as unknown as ProfileResponseDto);

    renderScreen(
      <GuildAcceptedState
        opened
        onClose={vi.fn()}
        contract={ACCEPTED_CONTRACT}
        lina={ACCEPT_LINA}
        onViewContracts={vi.fn()}
      />,
    );

    expect(await screen.findByText("+250 XP ao concluir")).toBeInTheDocument();
    expect(screen.getByText("+35 Selos")).toBeInTheDocument();
  });
});
