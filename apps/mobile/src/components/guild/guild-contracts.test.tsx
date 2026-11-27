// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { I18nProvider, type SupportedLanguage } from "@repo/locales";
import type {
  ClaimGuildContractResponseDto,
  GuildAccessResponseDto,
  GuildContractsListResponseDto,
  GuildContractDto,
  GuildRewardsResponseDto,
  LinaReceptionDto,
  ProfileResponseDto,
} from "@repo/wrapper/server";
import { GuildService, ProfileService } from "@repo/wrapper/server";
import type { ComponentProps, ReactElement, ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GuildAcceptedState } from "../../../../../packages/ui/src/components/guild/view/GuildAcceptedState";
import { GuildClaimCelebration } from "../../../../../packages/ui/src/components/guild/view/GuildClaimCelebration";
import { GuildContractList } from "../../../../../packages/ui/src/components/guild/view/GuildContractList";
import { GuildContractRow } from "../../../../../packages/ui/src/components/guild/view/GuildContractRow";
import expansionStyles from "../../../../../packages/ui/src/components/guild/view/GuildContractsExpansion.module.css";
import { GuildRewardsPanel } from "../../../../../packages/ui/src/components/guild/view/GuildRewardsPanel";
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
    LinaSprite: ({
      pose,
      isTalking,
      scale,
      hop,
    }: {
      pose: string;
      isTalking: boolean;
      scale: number;
      hop?: boolean;
    }) => (
      <span
        data-testid="lina-sprite"
        data-pose={pose}
        data-talking={String(isTalking)}
        data-scale={String(scale)}
        data-hop={String(Boolean(hop))}
      />
    ),
  }),
);

vi.mock(
  "../../../../../packages/ui/src/components/guild/scene/LinaDialogue",
  () => ({
    LinaDialogue: ({
      speaker,
      segments,
      actions,
      variant,
      startDelayMs,
    }: {
      speaker: string;
      segments: { text: string; highlight?: boolean }[];
      actions?: ReactNode;
      variant: string;
      startDelayMs?: number;
    }) => (
      <div
        data-testid="lina-dialogue"
        data-variant={variant}
        data-start-delay-ms={String(startDelayMs ?? "")}
      >
        <span>{speaker}</span>
        {segments.map((segment, index) => (
          <span
            key={index}
            data-highlight={segment.highlight ? "true" : undefined}
          >
            {segment.text}
          </span>
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

function createClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, retryDelay: 0 },
      mutations: { retry: false },
    },
  });
}

function MockLink({ children, ...props }: ComponentProps<"a">) {
  return <a {...props}>{children}</a>;
}

function renderScreen(ui: ReactElement, language: SupportedLanguage = "pt-BR") {
  return render(
    <I18nProvider language={language}>
      <MantineProvider>
        <QueryClientProvider client={createClient()}>
          <UIProvider
            presenters={{ Modal: TestModal, Link: MockLink }}
            hooks={{ useRouter: () => router }}
          >
            {ui}
          </UIProvider>
        </QueryClientProvider>
      </MantineProvider>
    </I18nProvider>,
  );
}

const ACCESS: GuildAccessResponseDto = {
  mode: "supporters",
  hasAccess: true,
} as GuildAccessResponseDto;

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
  acceptedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  readyAt: null,
  claimedAt: null,
  expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
} as unknown as GuildContractDto;

const ACCEPT_LINA = {
  trigger: "contract_accepted",
  pose: "happy",
  context: {
    contractId: "contract-1",
    category: "library",
    templateKey: "forgotten_relic",
    eventId: null,
    targetGameId: 1029,
    targetGameName: "Hollow Knight",
  },
  hasUnseenBoard: false,
} as unknown as LinaReceptionDto;

const EXPIRED_READY = {
  ...CONTRACT,
  status: "ready_to_claim",
  readyAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
} as unknown as GuildContractDto;

const CLAIM_RESULT = {
  contract: {
    ...CONTRACT,
    status: "completed",
    claimedAt: new Date().toISOString(),
  },
  xpAwarded: 325,
  globalXpAwarded: 81,
  rankBefore: "C",
  rankAfter: "B",
  unlockedRewards: [],
  chestResult: {
    bonusXp: 75,
    unlockedCosmetic: {
      id: "frame-lantern",
      key: "frame_lantern_glow",
      kind: "avatar_frame",
      achievementId: null,
      inChestPool: true,
      chestBonusXp: 0,
    },
  },
  lina: {
    trigger: "contract_claimed",
    pose: "happy",
    context: {
      contractId: "contract-1",
      xpAwarded: 325,
      rankBefore: "C",
      rankAfter: "B",
      rankedUp: true,
    },
    hasUnseenBoard: false,
  },
} as unknown as ClaimGuildContractResponseDto;

/** Small claim: `floor(xpAwarded × 0.25)` is zero, so no account XP line. */
const CLAIM_RESULT_WITHOUT_ACCOUNT_XP = {
  ...CLAIM_RESULT,
  xpAwarded: 25,
  globalXpAwarded: 0,
} as unknown as ClaimGuildContractResponseDto;

/** An `active` library contract accepted 5 days ago, 20 days left to finish. */
const ACTIVE_DEADLINE_CONTRACT = {
  ...CONTRACT,
  id: "contract-deadline",
  expiresAt: new Date(
    Date.now() + 20 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000,
  ).toISOString(),
} as unknown as GuildContractDto;

const REWARDS = {
  unlockedRewards: [
    {
      id: 1,
      reward: {
        id: "reward-title",
        key: "title_chronist",
        kind: "title",
        achievementId: null,
        inChestPool: false,
        chestBonusXp: 0,
      },
      sourceContractId: null,
      unlockedAt: "2026-11-21T12:00:00.000Z",
    },
    {
      id: 2,
      reward: {
        id: "reward-frame",
        key: "frame_lantern_glow",
        kind: "avatar_frame",
        achievementId: null,
        inChestPool: true,
        chestBonusXp: 0,
      },
      sourceContractId: null,
      unlockedAt: "2026-11-20T12:00:00.000Z",
    },
  ],
  equippedTitleKey: null,
  equippedFrameKey: null,
} as unknown as GuildRewardsResponseDto;

function mockContracts(contracts: GuildContractDto[]) {
  return vi
    .spyOn(GuildService, "guildControllerListContractsV1")
    .mockResolvedValue({
      data: contracts,
      pagination: {
        totalItems: contracts.length,
        totalPages: 1,
        hasNextPage: false,
      },
    } as GuildContractsListResponseDto);
}

beforeEach(() => {
  session.userId = "user-1";
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
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  session.userId = "user-1";
});

describe("GuildAcceptedState", () => {
  it("renders the stamped contract and wires the dialogue actions", async () => {
    vi.spyOn(
      ProfileService,
      "profileControllerFindOneByIdV1",
    ).mockResolvedValue({
      username: "cassi",
      guildTitleKey: "title_backlog_slayer",
    } as unknown as ProfileResponseDto);

    const onClose = vi.fn();
    const onViewContracts = vi.fn();

    renderScreen(
      <GuildAcceptedState
        opened
        onClose={onClose}
        contract={CONTRACT}
        lina={ACCEPT_LINA}
        onViewContracts={onViewContracts}
      />,
    );

    expect(screen.getByText("Relíquia Esquecida")).toBeInTheDocument();

    const card = screen
      .getByText("Relíquia Esquecida")
      .closest("[data-contract-id]") as HTMLElement;

    expect(within(card).getByText("Hollow Knight")).toBeInTheDocument();
    expect(within(card).getByText("B · +250 XP")).toBeInTheDocument();
    expect(await screen.findByText("Caçador de Backlog")).toBeInTheDocument();
    expect(screen.getByText("ACEITO")).toBeInTheDocument();
    expect(screen.getByText("+250 XP ao concluir")).toBeInTheDocument();

    const sprite = screen.getByTestId("lina-sprite");
    expect(sprite).toHaveAttribute("data-pose", "happy");
    expect(sprite).toHaveAttribute("data-hop", "true");
    expect(sprite).toHaveAttribute("data-scale", "6");

    const dialogue = screen.getByTestId("lina-dialogue");
    expect(dialogue).toHaveAttribute("data-variant", "modal");
    expect(dialogue).toHaveAttribute("data-start-delay-ms", "1000");
    expect(within(dialogue).getByText("Hollow Knight")).toHaveAttribute(
      "data-highlight",
      "true",
    );

    fireEvent.click(screen.getByRole("button", { name: "Voltar ao quadro" }));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.click(
      screen.getByRole("button", { name: "Ver contratos ativos" }),
    );
    expect(onViewContracts).toHaveBeenCalledTimes(1);
  });
});

describe("GuildClaimCelebration", () => {
  it("counts the Guild XP up and shows account XP, rank and chest rewards", async () => {
    const onClose = vi.fn();

    renderScreen(
      <GuildClaimCelebration opened onClose={onClose} result={CLAIM_RESULT} />,
      "en",
    );

    expect(screen.getByText("Contract complete")).toBeInTheDocument();

    await waitFor(
      () => expect(screen.getByText("+325 Guild XP")).toBeInTheDocument(),
      { timeout: 3000 },
    );

    expect(screen.getByText("+81 account XP")).toBeInTheDocument();
    expect(screen.getByText(/C → B/)).toBeInTheDocument();
    expect(screen.getByText("Lantern Glow")).toBeInTheDocument();
    expect(screen.getByText("Chest bonus: +75 XP")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("hides the account XP line when the claim awarded none", async () => {
    renderScreen(
      <GuildClaimCelebration
        opened
        onClose={vi.fn()}
        result={CLAIM_RESULT_WITHOUT_ACCOUNT_XP}
      />,
      "en",
    );

    await waitFor(
      () => expect(screen.getByText("+25 Guild XP")).toBeInTheDocument(),
      { timeout: 3000 },
    );

    expect(screen.queryByText(/account XP/)).not.toBeInTheDocument();
  });
});

describe("GuildContractList", () => {
  it("keeps an expired ready_to_claim contract turn-in-able", async () => {
    mockContracts([EXPIRED_READY]);
    const claim = vi
      .spyOn(GuildService, "guildControllerClaimContractV1")
      .mockResolvedValue(CLAIM_RESULT);

    renderScreen(<GuildContractList tab="accepted" />);

    expect(await screen.findByText("Pronto para entregar")).toBeInTheDocument();

    fireEvent.click(await screen.findByRole("button", { name: "Entregar" }));

    await waitFor(() => expect(claim).toHaveBeenCalledWith(EXPIRED_READY.id));
    expect(await screen.findByText("Contrato concluído")).toBeInTheDocument();
  });

  it("shows the deadline on active rows but never on ready-to-claim ones", async () => {
    mockContracts([ACTIVE_DEADLINE_CONTRACT, EXPIRED_READY]);

    renderScreen(<GuildContractList tab="accepted" />);

    const activeRow = await waitFor(() => {
      const row = document.querySelector<HTMLElement>(
        '[data-contract-id="contract-deadline"]',
      );
      expect(row).not.toBeNull();
      return row as HTMLElement;
    });

    expect(within(activeRow).getByText(/Expira em 20d/)).toBeInTheDocument();
    expect(
      within(activeRow).getByText(
        /Só contam jogos que você marcar como zerados/,
      ),
    ).toBeInTheDocument();

    const readyRow = document.querySelector<HTMLElement>(
      `[data-contract-id="${EXPIRED_READY.id}"]`,
    ) as HTMLElement;

    expect(
      within(readyRow).getByText("Pronto para entregar"),
    ).toBeInTheDocument();
    expect(within(readyRow).queryByText(/Expira em/)).not.toBeInTheDocument();
    expect(
      within(readyRow).queryByText(
        /Só contam jogos que você marcar como zerados/,
      ),
    ).not.toBeInTheDocument();
    expect(
      within(readyRow).getByRole("button", { name: "Entregar" }),
    ).toBeInTheDocument();
  });

  it("explains manual finishes on an active finish_game contract without progress", async () => {
    mockContracts([CONTRACT]);

    renderScreen(<GuildContractList tab="accepted" />);

    const row = await waitFor(() => {
      const element = document.querySelector<HTMLElement>(
        `[data-contract-id="${CONTRACT.id}"]`,
      );
      expect(element).not.toBeNull();
      return element as HTMLElement;
    });

    expect(
      within(row).getByText(
        "Só contam jogos que você marcar como zerados depois de aceitar. Importações e jogos zerados de novo não contam.",
      ),
    ).toBeInTheDocument();
  });

  it("asks for confirmation before abandoning an active contract", async () => {
    mockContracts([CONTRACT]);
    const abandon = vi
      .spyOn(GuildService, "guildControllerAbandonContractV1")
      .mockResolvedValue({
        ...CONTRACT,
        status: "abandoned",
      } as unknown as GuildContractDto);

    renderScreen(<GuildContractList tab="accepted" />);

    fireEvent.click(await screen.findByRole("button", { name: "Abandonar" }));

    const dialog = await screen.findByRole("dialog", {
      name: "Abandonar contrato?",
    });
    expect(
      within(dialog).getByText(
        /Você vai devolver "Relíquia Esquecida" ao quadro/,
      ),
    ).toBeInTheDocument();

    const confirmButton = within(dialog).getByRole("button", {
      name: "Abandonar",
    });
    expect(confirmButton.className).toContain(expansionStyles.dangerButton);
    fireEvent.click(confirmButton);

    await waitFor(() => expect(abandon).toHaveBeenCalledWith(CONTRACT.id));
  });

  it("shows Arc-specific abandon copy when abandoning a chain contract", async () => {
    const chainContract = {
      ...CONTRACT,
      id: "contract-chain-1",
      chainProgressId: "chain-progress-1",
    } as unknown as GuildContractDto;
    mockContracts([chainContract]);

    renderScreen(<GuildContractList tab="accepted" />, "en");

    fireEvent.click(await screen.findByRole("button", { name: "Abandon" }));

    const dialog = await screen.findByRole("dialog", {
      name: "Abandon this contract?",
    });
    expect(
      within(dialog).getByText(
        'This cancels the current stage of "Forgotten Relic". You can retry the stage from the Arcs tab.',
      ),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole("button", { name: "Abandon" }).className,
    ).toContain(expansionStyles.dangerButton);
  });

  it("renders a retryable GuildQueryError when the contract list fails to load", async () => {
    const list = vi
      .spyOn(GuildService, "guildControllerListContractsV1")
      .mockRejectedValue(new Error("Contracts unavailable"));

    renderScreen(<GuildContractList tab="accepted" />, "en");

    const alert = await screen.findByRole("alert");
    expect(within(alert).getByText("Contracts unavailable")).toBeInTheDocument();

    const callsBeforeRetry = list.mock.calls.length;
    list.mockResolvedValueOnce({
      data: [CONTRACT],
      pagination: { totalItems: 1, totalPages: 1, hasNextPage: false },
    } as GuildContractsListResponseDto);

    fireEvent.click(within(alert).getByRole("button", { name: "Retry" }));

    await waitFor(() =>
      expect(list).toHaveBeenCalledTimes(callsBeforeRetry + 1),
    );
    expect(await screen.findByText("Forgotten Relic")).toBeInTheDocument();
  });
});

describe("GuildContractRow", () => {
  it("links the target game to its detail page with crisp 20x27 cover art", () => {
    const coveredContract = {
      ...CONTRACT,
      targetGameId: 1029,
      targetGame: {
        gameId: 1029,
        name: "Hollow Knight",
        slug: "hollow-knight",
        coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1rgi.jpg",
      },
    } as unknown as GuildContractDto;

    renderScreen(<GuildContractRow contract={coveredContract} />, "en");

    const link = screen.getByRole("link", { name: "Hollow Knight" });
    expect(link).toHaveAttribute("href", "/game/1029");

    const img = link.querySelector("img");
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute("width", "20");
    expect(img).toHaveAttribute("height", "27");
    expect(img?.style.imageRendering).toBe("auto");
    expect(img?.style.objectFit).toBe("cover");
  });
});

describe("GuildRewardsPanel", () => {
  it("equips an unlocked title through the cosmetics endpoint", async () => {
    vi.spyOn(GuildService, "guildControllerGetRewardsV1").mockResolvedValue(
      REWARDS,
    );
    const update = vi
      .spyOn(GuildService, "guildControllerUpdateCosmeticsV1")
      .mockResolvedValue({
        guildTitleKey: "title_chronist",
        guildFrameKey: null,
        equippedLicenseThemeKey: null,
        equippedStampStyleKey: null,
        equippedDecorKeys: [],
        showcaseBadgeIds: [],
      });

    renderScreen(<GuildRewardsPanel />, "en");

    const titlesSection = (await screen.findByText("Titles")).closest(
      "details",
    ) as HTMLDetailsElement | null;

    expect(titlesSection?.open).toBe(false);
    fireEvent.click(within(titlesSection as HTMLElement).getByText("Titles"));
    expect(titlesSection?.open).toBe(true);

    expect(screen.getByText("Chronicler")).toBeInTheDocument();
    expect(screen.getByText("Lantern Glow")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Equip: Chronicler" }));

    await waitFor(() =>
      expect(update).toHaveBeenCalledWith({
        guildTitleKey: "title_chronist",
      }),
    );
    expect(update).toHaveBeenCalledTimes(1);
  });
});
