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
  GuildOverviewResponseDto,
  GuildRewardsResponseDto,
  GuildRewardDescriptorDto,
} from "@repo/wrapper/server";
import { GuildService } from "@repo/wrapper/server";
import type { ComponentProps, ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GuildActiveContracts } from "../../../../../packages/ui/src/components/guild/view/GuildActiveContracts";
import { GuildClaimCelebration } from "../../../../../packages/ui/src/components/guild/view/GuildClaimCelebration";
import { GuildContractList } from "../../../../../packages/ui/src/components/guild/view/GuildContractList";
import { GuildExtendContractModal } from "../../../../../packages/ui/src/components/guild/view/GuildExtendContractModal";
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
    LinaSprite: ({ pose }: { pose: string }) => (
      <span data-testid="lina-sprite" data-pose={pose} />
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

function MockLink({ children, ...props }: ComponentProps<"a">) {
  return <a {...props}>{children}</a>;
}

function renderScreen(ui: ReactElement, language: SupportedLanguage = "en") {
  return render(
    <I18nProvider language={language}>
      <MantineProvider>
        <QueryClientProvider
          client={
            new QueryClient({
              defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
              },
            })
          }
        >
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

const DAY_MS = 24 * 60 * 60 * 1000;

const ACCESS = {
  mode: "supporters",
  hasAccess: true,
} as GuildAccessResponseDto;

function buildContract(
  overrides: Record<string, unknown> = {},
): GuildContractDto {
  const now = Date.now();

  return {
    id: "contract-1",
    boardEntryId: "board-1",
    eventId: null,
    category: "library",
    templateKey: "forgotten_relic",
    rank: "B",
    xpReward: 250,
    sealsReward: 20,
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
    acceptedAt: new Date(now - 5 * DAY_MS).toISOString(),
    readyAt: null,
    claimedAt: null,
    expiresAt: new Date(now + 10 * DAY_MS).toISOString(),
    createdAt: new Date(now - 5 * DAY_MS).toISOString(),
    updatedAt: new Date(now - 5 * DAY_MS).toISOString(),
    ...overrides,
  } as unknown as GuildContractDto;
}

function buildOverview(
  options: {
    maxActiveContracts?: number;
    monthlyFreeHourglass?: number;
    activeChain?: GuildOverviewResponseDto["activeChain"];
  } = {},
): GuildOverviewResponseDto {
  return {
    license: {
      perks: {
        maxActiveContracts: options.maxActiveContracts ?? 3,
        weeklyRerolls: 1,
        monthlyExpedition: true,
        monthlyExpeditionRankS: false,
        monthlyFreeHourglass: options.monthlyFreeHourglass ?? 0,
        legendaryContracts: false,
      },
    },
    activeChain: options.activeChain ?? null,
  } as unknown as GuildOverviewResponseDto;
}

function buildRewards(hourglass: number): GuildRewardsResponseDto {
  return {
    unlockedRewards: [],
    equippedTitleKey: null,
    equippedFrameKey: null,
    equippedLicenseThemeKey: null,
    equippedStampStyleKey: null,
    equippedDecorKeys: [],
    showcaseBadgeIds: [],
    sealsBalance: 0,
    consumables: {
      hourglass,
      reroll_charter: 0,
      extra_slot_permit: 0,
    },
  } as unknown as GuildRewardsResponseDto;
}

function buildReward(
  key: string,
  kind: string,
  rarity: string = "rare",
  overrides: Partial<GuildRewardDescriptorDto> = {},
): GuildRewardDescriptorDto {
  return {
    id: key,
    key,
    kind: kind as GuildRewardDescriptorDto["kind"],
    achievementId: null,
    inChestPool: true,
    chestBonusXp: 0,
    chestBonusSeals: 0,
    rarity: rarity as GuildRewardDescriptorDto["rarity"],
    consumableKey: null,
    ...overrides,
  } as GuildRewardDescriptorDto;
}

function buildClaimResult(
  overrides: Record<string, unknown> = {},
): ClaimGuildContractResponseDto {
  return {
    contract: buildContract({ status: "completed" }),
    xpAwarded: 250,
    globalXpAwarded: 62,
    rankBefore: "C",
    rankAfter: "C",
    sealsAwarded: 20,
    bonusCompleted: false,
    unlockedRewards: [],
    chestResult: null,
    promotionRewards: [],
    prestigeRewards: [],
    passportMonth: { monthKey: "2026-11", completedContractsCount: 1 },
    chainProgress: null,
    lina: {
      trigger: "contract_claimed",
      pose: "happy",
      context: {
        contractId: "contract-1",
        xpAwarded: 250,
        sealsAwarded: 20,
        rankBefore: "C",
        rankAfter: "C",
        rankedUp: false,
      },
      hasUnseenBoard: false,
    },
    ...overrides,
  } as unknown as ClaimGuildContractResponseDto;
}

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

describe("GuildActiveContracts cap", () => {
  it("reads the Rank B cap from license.perks and shows active / max", async () => {
    vi.spyOn(GuildService, "guildControllerGetOverviewV1").mockResolvedValue(
      buildOverview({ maxActiveContracts: 4 }),
    );
    vi.spyOn(GuildService, "guildControllerGetRewardsV1").mockResolvedValue(
      buildRewards(0),
    );

    renderScreen(
      <GuildActiveContracts
        contracts={[
          buildContract({ id: "contract-1" }),
          buildContract({ id: "contract-2" }),
          buildContract({ id: "contract-3" }),
        ]}
        yearGoal={null}
      />,
    );

    const cap = await screen.findByText("3 / 4 contracts");
    expect(cap).toBeInTheDocument();
    expect(cap).toHaveAttribute("data-max-active-contracts", "4");
  });
});

describe("GuildContractList extension", () => {
  it("offers Extend +7 days with an Hourglass, confirms and shows the new deadline", async () => {
    const original = buildContract({
      id: "contract-extendable",
      sealsReward: 25,
      bonusObjective: { type: "also_write_review", minChars: 150 },
      bonusCompleted: false,
    });
    const newExpiry = new Date(
      Date.now() + 14 * DAY_MS + 60 * 60 * 1000,
    ).toISOString();
    let servedContracts = [original];

    const list = vi
      .spyOn(GuildService, "guildControllerListContractsV1")
      .mockImplementation(
        () =>
          Promise.resolve({
            data: servedContracts,
            pagination: {
              totalItems: servedContracts.length,
              totalPages: 1,
              hasNextPage: false,
            },
          }) as unknown as ReturnType<
            typeof GuildService.guildControllerListContractsV1
          >,
      );

    vi.spyOn(GuildService, "guildControllerGetOverviewV1").mockResolvedValue(
      buildOverview({ maxActiveContracts: 4, monthlyFreeHourglass: 0 }),
    );
    vi.spyOn(GuildService, "guildControllerGetRewardsV1").mockResolvedValue(
      buildRewards(1),
    );

    const extend = vi
      .spyOn(GuildService, "guildControllerExtendContractV1")
      .mockImplementation((contractId) => {
        const extended = buildContract({
          ...original,
          id: contractId,
          extendedCount: 1,
          expiresAt: newExpiry,
        });
        servedContracts = [extended];

        return Promise.resolve({
          contract: extended,
          extensionDays: 7,
          usedFreeMonthlyHourglass: false,
          remainingHourglasses: 0,
        }) as unknown as ReturnType<
          typeof GuildService.guildControllerExtendContractV1
        >;
      });

    renderScreen(<GuildContractList tab="accepted" />);

    const row = await waitFor(() => {
      const element = document.querySelector<HTMLElement>(
        `[data-contract-id="${original.id}"]`,
      );
      expect(element).not.toBeNull();
      return element as HTMLElement;
    });

    expect(within(row).getByText("+250 XP")).toBeInTheDocument();
    expect(within(row).getByText("+25 Seals")).toBeInTheDocument();
    expect(
      within(row).getByText("Also write a review of 150+ characters"),
    ).toBeInTheDocument();
    expect(
      within(row).getByText("Bonus objective pending"),
    ).toBeInTheDocument();

    fireEvent.click(
      within(row).getByRole("button", { name: "Extend +7 days" }),
    );

    const dialog = await screen.findByRole("dialog", {
      name: "Extend this contract?",
    });

    const expectedCurrent = new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
    }).format(new Date(original.expiresAt as string));
    const expectedNew = new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
    }).format(new Date(new Date(original.expiresAt as string).getTime() + 7 * DAY_MS));

    expect(within(dialog).getByText("Forgotten Relic")).toBeInTheDocument();
    expect(within(dialog).getByText("Hollow Knight")).toBeInTheDocument();
    expect(
      within(dialog).getByText(`Current deadline: ${expectedCurrent}`),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText(`New deadline (+7 days): ${expectedNew}`),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText(
        "Spends 1 Hourglass from your inventory (1 owned).",
      ),
    ).toBeInTheDocument();

    fireEvent.click(
      within(dialog).getByRole("button", { name: "Extend +7 days" }),
    );

    await waitFor(() => expect(extend).toHaveBeenCalledWith(original.id));
    expect(await screen.findByText("Extended by 7 days")).toBeInTheDocument();
    expect(screen.getByText("Hourglass used")).toBeInTheDocument();
    await waitFor(() =>
      expect(within(row).getByText(/Expires in 14d/)).toBeInTheDocument(),
    );

    await waitFor(() =>
      expect(
        within(row).queryByRole("button", { name: "Extend +7 days" }),
      ).not.toBeInTheDocument(),
    );
    expect(list).toHaveBeenCalled();
  });

  it("does not offer the extension without an Hourglass or free monthly allowance", async () => {
    const plain = buildContract({ id: "contract-plain" });
    mockContracts([plain]);
    vi.spyOn(GuildService, "guildControllerGetOverviewV1").mockResolvedValue(
      buildOverview({ maxActiveContracts: 3, monthlyFreeHourglass: 0 }),
    );
    const rewards = vi
      .spyOn(GuildService, "guildControllerGetRewardsV1")
      .mockResolvedValue(buildRewards(0));

    renderScreen(<GuildContractList tab="accepted" />);

    const row = await waitFor(() => {
      const element = document.querySelector<HTMLElement>(
        `[data-contract-id="${plain.id}"]`,
      );
      expect(element).not.toBeNull();
      return element as HTMLElement;
    });

    await waitFor(() => expect(rewards).toHaveBeenCalled());
    expect(
      within(row).queryByRole("button", { name: "Extend +7 days" }),
    ).not.toBeInTheDocument();
  });

  it("hides the extension on a contract already extended", async () => {
    const extended = buildContract({
      id: "contract-already-extended",
      extendedCount: 1,
    });
    const extendable = buildContract({ id: "contract-still-extendable" });
    mockContracts([extended, extendable]);
    vi.spyOn(GuildService, "guildControllerGetOverviewV1").mockResolvedValue(
      buildOverview({ maxActiveContracts: 4 }),
    );
    vi.spyOn(GuildService, "guildControllerGetRewardsV1").mockResolvedValue(
      buildRewards(2),
    );

    renderScreen(<GuildContractList tab="accepted" />);

    const extendedRow = await waitFor(() => {
      const element = document.querySelector<HTMLElement>(
        `[data-contract-id="${extended.id}"]`,
      );
      expect(element).not.toBeNull();
      return element as HTMLElement;
    });
    const extendableRow = document.querySelector<HTMLElement>(
      `[data-contract-id="${extendable.id}"]`,
    ) as HTMLElement;

    expect(
      within(extendedRow).queryByRole("button", { name: "Extend +7 days" }),
    ).not.toBeInTheDocument();
    await waitFor(() =>
      expect(
        within(extendableRow).getByRole("button", { name: "Extend +7 days" }),
      ).toBeInTheDocument(),
    );
  });

  it("shows the chain stage label only on the active chain's contract", async () => {
    const chained = buildContract({
      id: "contract-chained",
      chainProgressId: "chain-progress-1",
      sealsReward: 35,
    });
    const other = buildContract({
      id: "contract-other",
      chainProgressId: null,
    });
    mockContracts([chained, other]);
    vi.spyOn(GuildService, "guildControllerGetOverviewV1").mockResolvedValue(
      buildOverview({
        maxActiveContracts: 4,
        activeChain: {
          chainKey: "pathfinders_arc",
          status: "in_progress",
          currentStageIndex: 1,
          totalStages: 3,
          boundTargetGameId: 1029,
          activeContractId: chained.id,
        } as unknown as GuildOverviewResponseDto["activeChain"],
      }),
    );
    vi.spyOn(GuildService, "guildControllerGetRewardsV1").mockResolvedValue(
      buildRewards(0),
    );

    renderScreen(<GuildContractList tab="accepted" />);

    const chainedRow = await waitFor(() => {
      const element = document.querySelector<HTMLElement>(
        `[data-contract-id="${chained.id}"]`,
      );
      expect(element).not.toBeNull();
      return element as HTMLElement;
    });

    await waitFor(() =>
      expect(
        within(chainedRow).getByText("Pathfinder's Arc · stage 2"),
      ).toBeInTheDocument(),
    );
    expect(within(chainedRow).getByText("+35 Seals")).toBeInTheDocument();

    const otherRow = document.querySelector<HTMLElement>(
      `[data-contract-id="${other.id}"]`,
    ) as HTMLElement;
    expect(within(otherRow).queryByText(/stage/)).not.toBeInTheDocument();
  });
});

describe("GuildExtendContractModal", () => {
  it("shows contract, target game, +7d deadline projection and free monthly Hourglass copy", () => {
    const expiresAt = "2026-12-01T12:00:00.000Z";
    const contract = buildContract({ expiresAt });
    const expectedCurrent = new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
    }).format(new Date(expiresAt));
    const expectedNew = new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
    }).format(new Date("2026-12-08T12:00:00.000Z"));

    renderScreen(
      <GuildExtendContractModal
        contract={contract}
        freeHourglassAvailable
        ownedHourglasses={2}
        onClose={vi.fn()}
      />,
    );

    const dialog = screen.getByRole("dialog", {
      name: "Extend this contract?",
    });
    expect(within(dialog).getByText("Forgotten Relic")).toBeInTheDocument();
    expect(within(dialog).getByText("Hollow Knight")).toBeInTheDocument();
    expect(
      within(dialog).getByText(`Current deadline: ${expectedCurrent}`),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText(`New deadline (+7 days): ${expectedNew}`),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText(
        "Uses your free monthly Hourglass (no inventory Hourglass spent).",
      ),
    ).toBeInTheDocument();
  });

  it("shows inventory Hourglass count when no free monthly Hourglass is available", () => {
    const contract = buildContract({
      expiresAt: "2026-12-01T12:00:00.000Z",
    });

    renderScreen(
      <GuildExtendContractModal
        contract={contract}
        freeHourglassAvailable={false}
        ownedHourglasses={3}
        onClose={vi.fn()}
      />,
    );

    const dialog = screen.getByRole("dialog", {
      name: "Extend this contract?",
    });
    expect(
      within(dialog).getByText(
        "Spends 1 Hourglass from your inventory (3 owned).",
      ),
    ).toBeInTheDocument();
  });
});

describe("GuildClaimCelebration expansion", () => {
  it("shows the promotion claim: Seals, chest, Rank package and Lina's rank line", async () => {
    const result = buildClaimResult({
      rankBefore: "C",
      rankAfter: "B",
      sealsAwarded: 95,
      bonusCompleted: true,
      promotionRewards: [
        buildReward("frame_forged_steel", "avatar_frame", "epic"),
        buildReward("decor_sleeping_cat", "tavern_decor", "epic"),
      ],
      chestResult: {
        chestKind: "chest_silver",
        bonusXp: 75,
        bonusSeals: 30,
        unlockedCosmetic: null,
        grantedConsumable: null,
      } as unknown as ClaimGuildContractResponseDto["chestResult"],
      passportMonth: { monthKey: "2026-11", completedContractsCount: 3 },
      lina: {
        trigger: "rank_promoted",
        pose: "happy",
        context: {
          contractId: "contract-1",
          xpAwarded: 250,
          sealsAwarded: 95,
          rankBefore: "C",
          rankAfter: "B",
          rankedUp: true,
        },
        hasUnseenBoard: false,
      },
    });

    renderScreen(
      <GuildClaimCelebration opened onClose={vi.fn()} result={result} />,
    );

    expect(screen.getByText("+95 Seals")).toBeInTheDocument();
    expect(screen.getByText(/C → B/)).toBeInTheDocument();
    expect(screen.getByText("Bonus objective complete")).toBeInTheDocument();
    expect(screen.getByText("Silver Chest")).toBeInTheDocument();
    expect(screen.getByText("Rank promotion")).toBeInTheDocument();
    expect(screen.getByText("Veteran's Kit")).toBeInTheDocument();
    expect(screen.getByText("Forged Steel")).toBeInTheDocument();
    expect(screen.getByText("Sleeping Cat")).toBeInTheDocument();
    expect(screen.getByText("3 / 6 contracts this month")).toBeInTheDocument();
    expect(
      screen.getByText("A new rank! Your Guild License bears a new seal."),
    ).toBeInTheDocument();
  });

  it("opens one Relic chest block per Prestige star", async () => {
    const result = buildClaimResult({
      prestigeRewards: [
        {
          chestKind: "chest_relic",
          bonusXp: 200,
          bonusSeals: 120,
          unlockedCosmetic: buildReward(
            "title_lina_chosen",
            "title",
            "legendary",
          ),
          grantedConsumable: "hourglass",
        },
      ] as unknown as ClaimGuildContractResponseDto["prestigeRewards"],
      lina: {
        trigger: "contract_claimed",
        pose: "happy",
        context: { contractId: "contract-1", rankedUp: false },
        hasUnseenBoard: false,
      },
    });

    renderScreen(
      <GuildClaimCelebration opened onClose={vi.fn()} result={result} />,
    );

    const prestige = document.querySelector<HTMLElement>(
      "[data-claim-prestige]",
    ) as HTMLElement;
    expect(prestige).not.toBeNull();
    expect(within(prestige).getByText("New Prestige star")).toBeInTheDocument();
    expect(within(prestige).getByText("Relic Chest")).toBeInTheDocument();

    const relic = prestige.querySelector<HTMLElement>(
      '[data-chest-kind="chest_relic"]',
    ) as HTMLElement;
    expect(within(relic).getByText("Lina's Chosen")).toBeInTheDocument();
    expect(within(relic).getByText("Legendary")).toBeInTheDocument();
    expect(within(relic).getByText("Hourglass")).toBeInTheDocument();
  });

  it("shows the completed chain, its final rewards and Lina's chain line", async () => {
    const result = buildClaimResult({
      chainProgress: {
        chainKey: "pathfinders_arc",
        currentStageIndex: 2,
        status: "completed",
        chainCompleted: true,
        finalRewards: [
          buildReward("title_pathfinder", "title", "rare"),
          buildReward("decor_compass_rose", "tavern_decor", "epic"),
        ],
        bonusSealsAwarded: 100,
      } as unknown as ClaimGuildContractResponseDto["chainProgress"],
      lina: {
        trigger: "chain_completed",
        pose: "happy",
        context: {
          contractId: "contract-1",
          chainKey: "pathfinders_arc",
          rankedUp: false,
        },
        hasUnseenBoard: false,
      },
    });

    renderScreen(
      <GuildClaimCelebration opened onClose={vi.fn()} result={result} />,
    );

    const chain = document.querySelector<HTMLElement>(
      "[data-claim-chain]",
    ) as HTMLElement;
    expect(chain).not.toBeNull();
    expect(chain).toHaveAttribute("data-chain-completed", "true");
    expect(within(chain).getByText("Arc complete!")).toBeInTheDocument();
    expect(within(chain).getByText("Pathfinder")).toBeInTheDocument();
    expect(within(chain).getByText("Compass Rose")).toBeInTheDocument();
    expect(within(chain).getByText("+100 bonus Seals")).toBeInTheDocument();
    expect(
      screen.getByText(
        "The arc is complete! Lina keeps the final relic safe for you.",
      ),
    ).toBeInTheDocument();
  });

  it("shows the running chain stage when the claim did not complete the arc", async () => {
    const result = buildClaimResult({
      chainProgress: {
        chainKey: "pathfinders_arc",
        currentStageIndex: 1,
        status: "in_progress",
        chainCompleted: false,
        finalRewards: [],
        bonusSealsAwarded: 0,
      } as unknown as ClaimGuildContractResponseDto["chainProgress"],
    });

    renderScreen(
      <GuildClaimCelebration opened onClose={vi.fn()} result={result} />,
    );

    const chain = document.querySelector<HTMLElement>(
      "[data-claim-chain]",
    ) as HTMLElement;
    expect(within(chain).getByText("Arc progress")).toBeInTheDocument();
    expect(within(chain).getByText("Stage 2 of 3")).toBeInTheDocument();
  });
});
