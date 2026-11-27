// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nProvider, type SupportedLanguage } from "@repo/locales";
import type {
  GuildEmporiumListingDto,
  GuildEmporiumPurchaseResponseDto,
  GuildEmporiumResponseDto,
  GuildOverviewResponseDto,
  GuildPassportResponseDto,
  GuildRewardDescriptorDto,
} from "@repo/wrapper/server";
import {
  ClaimGuildPassportMilestoneResponseDto,
  GuildAccessResponseDto,
  GuildChestResultDto,
  GuildEmporiumListingDto as EmporiumListing,
  GuildPassportMilestoneDto,
  GuildRewardDescriptorDto as RewardDescriptor,
  GuildService,
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

import { GuildEmporium } from "../../../../../packages/ui/src/components/guild/view/GuildEmporium";
import { GuildPassportCard } from "../../../../../packages/ui/src/components/guild/view/GuildPassportCard";
import economyClasses from "../../../../../packages/ui/src/components/guild/view/GuildEconomy.module.css";
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

const ACCESS: GuildAccessResponseDto = {
  mode: GuildAccessResponseDto.mode.SUPPORTERS,
  hasAccess: true,
};

const LICENSE_ITEM_ID = "f2af7e19-b835-4311-89de-88148b57c07d";
const HOURGLASS_ITEM_ID = "556f387f-728f-4c45-a54a-7e5003855e1a";
const LIMIT_REACHED_ITEM_ID = "0b6f5d6e-3f0e-4b7e-9b3d-0e3c4c5a6f21";
const TAVERN_LEDGER_ITEM_ID = "29419e53-57f0-4a56-a104-d93cf7b52005";
const RANK_LOCKED_ITEM_ID = "db4d18ca-084b-4b44-8064-ea6cfc1af4ac";
const CHEST_ITEM_ID = "chest-listing-1";

const OBSIDIAN_REWARD = {
  id: "reward-obsidian",
  key: "license_obsidian_ledger",
  kind: RewardDescriptor.kind.LICENSE_THEME,
  achievementId: null,
  inChestPool: false,
  chestBonusXp: 0,
  chestBonusSeals: 0,
  rarity: RewardDescriptor.rarity.EPIC,
  consumableKey: null,
} satisfies GuildRewardDescriptorDto;

const HOURGLASS_REWARD = {
  id: "reward-hourglass",
  key: "hourglass",
  kind: RewardDescriptor.kind.CONSUMABLE,
  achievementId: null,
  inChestPool: false,
  chestBonusXp: 0,
  chestBonusSeals: 0,
  rarity: RewardDescriptor.rarity.RARE,
  consumableKey: RewardDescriptor.consumableKey.HOURGLASS,
} satisfies GuildRewardDescriptorDto;

const TAVERN_LEDGER_REWARD = {
  id: "reward-tavern-ledger",
  key: "license_tavern_ledger",
  kind: RewardDescriptor.kind.LICENSE_THEME,
  achievementId: null,
  inChestPool: false,
  chestBonusXp: 0,
  chestBonusSeals: 0,
  rarity: RewardDescriptor.rarity.RARE,
  consumableKey: null,
} satisfies GuildRewardDescriptorDto;

const PUMPKIN_STAMP_REWARD = {
  id: "reward-pumpkin",
  key: "stamp_pumpkin_wax",
  kind: RewardDescriptor.kind.STAMP_STYLE,
  achievementId: null,
  inChestPool: false,
  chestBonusXp: 0,
  chestBonusSeals: 0,
  rarity: RewardDescriptor.rarity.UNCOMMON,
  consumableKey: null,
} satisfies GuildRewardDescriptorDto;

const BRONZE_CHEST_REWARD = {
  id: "reward-bronze-chest",
  key: "chest_bronze",
  kind: RewardDescriptor.kind.CHEST_BRONZE,
  achievementId: null,
  inChestPool: false,
  chestBonusXp: 0,
  chestBonusSeals: 0,
  rarity: RewardDescriptor.rarity.COMMON,
  consumableKey: null,
} satisfies GuildRewardDescriptorDto;

function listing(
  overrides: Partial<GuildEmporiumListingDto> &
    Pick<GuildEmporiumListingDto, "id" | "reward">,
): GuildEmporiumListingDto {
  return {
    priceSeals: 100,
    minRank: EmporiumListing.minRank.E,
    isRotating: false,
    maxPurchasesPerMonth: null,
    owned: false,
    purchasedThisMonth: 0,
    canPurchase: true,
    ...overrides,
  };
}

function buildEmporium(): GuildEmporiumResponseDto {
  return {
    sealsBalance: 150,
    monthKey: "2026-11",
    nextRotationAt: "2026-12-01T03:00:00.000Z",
    permanentItems: [
      listing({
        id: LICENSE_ITEM_ID,
        reward: OBSIDIAN_REWARD,
        priceSeals: 120,
        minRank: EmporiumListing.minRank.C,
      }),
      listing({
        id: HOURGLASS_ITEM_ID,
        reward: HOURGLASS_REWARD,
        priceSeals: 60,
        maxPurchasesPerMonth: 5,
        purchasedThisMonth: 2,
      }),
      listing({
        id: TAVERN_LEDGER_ITEM_ID,
        reward: TAVERN_LEDGER_REWARD,
        priceSeals: 200,
        canPurchase: false,
      }),
      listing({
        id: LIMIT_REACHED_ITEM_ID,
        reward: HOURGLASS_REWARD,
        priceSeals: 60,
        maxPurchasesPerMonth: 2,
        purchasedThisMonth: 2,
        canPurchase: false,
      }),
    ],
    rotatingItems: [
      listing({
        id: RANK_LOCKED_ITEM_ID,
        reward: PUMPKIN_STAMP_REWARD,
        priceSeals: 90,
        minRank: EmporiumListing.minRank.A,
        isRotating: true,
        canPurchase: false,
      }),
      listing({
        id: CHEST_ITEM_ID,
        reward: BRONZE_CHEST_REWARD,
        priceSeals: 40,
        isRotating: true,
        maxPurchasesPerMonth: 3,
      }),
    ],
  };
}

const PASSPORT: GuildPassportResponseDto = {
  monthKey: "2026-11",
  completedContractsCount: 4,
  resetsAt: "2026-12-01T03:00:00.000Z",
  milestones: [
    {
      milestone: 2,
      status: GuildPassportMilestoneDto.status.CLAIMED,
      chestKind: GuildPassportMilestoneDto.chestKind.CHEST_BRONZE,
      sealsReward: 25,
      consumableKey: null,
      consumableQuantity: 0,
    },
    {
      milestone: 4,
      status: GuildPassportMilestoneDto.status.CLAIMABLE,
      chestKind: GuildPassportMilestoneDto.chestKind.CHEST_SILVER,
      sealsReward: 50,
      consumableKey: null,
      consumableQuantity: 0,
    },
    {
      milestone: 6,
      status: GuildPassportMilestoneDto.status.LOCKED,
      chestKind: GuildPassportMilestoneDto.chestKind.CHEST_GOLD,
      sealsReward: 100,
      consumableKey: GuildPassportMilestoneDto.consumableKey.HOURGLASS,
      consumableQuantity: 1,
    },
  ],
};

const CLAIM_RESULT: ClaimGuildPassportMilestoneResponseDto = {
  monthKey: "2026-11",
  milestone: 4,
  claimedMilestones: [2, 4],
  completedContractsCount: 4,
  chestResult: {
    chestKind: GuildChestResultDto.chestKind.CHEST_SILVER,
    bonusXp: 75,
    bonusSeals: 30,
    unlockedCosmetic: null,
    grantedConsumable: null,
  },
  sealsAwarded: 80,
  consumableKey: null,
  consumableQuantity: 0,
  xpAwarded: 75,
  globalXpAwarded: 18,
  rankBefore: ClaimGuildPassportMilestoneResponseDto.rankBefore.C,
  rankAfter: ClaimGuildPassportMilestoneResponseDto.rankAfter.C,
};

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

function renderScreen(ui: ReactElement, language: SupportedLanguage = "en") {
  return render(
    <I18nProvider language={language}>
      <MantineProvider>
        <QueryClientProvider client={createClient()}>
          <UIProvider
            presenters={{ Modal: TestModal }}
            hooks={{ useRouter: () => router }}
          >
            {ui}
          </UIProvider>
        </QueryClientProvider>
      </MantineProvider>
    </I18nProvider>,
  );
}

function buildOverview(rank: "E" | "D" | "C" | "B" | "A" | "S") {
  return {
    license: {
      rank,
      equippedStampStyleKey: "stamp_gold_seal",
    },
  } as unknown as GuildOverviewResponseDto;
}

let emporiumFixture: GuildEmporiumResponseDto;
let passportFixture: GuildPassportResponseDto;
let overviewFixture: GuildOverviewResponseDto;

function mockGuildReads() {
  vi.spyOn(GuildService, "guildControllerGetAccessV1").mockResolvedValue(
    ACCESS,
  );
  vi.spyOn(GuildService, "guildControllerGetOverviewV1").mockImplementation(
    () =>
      Promise.resolve(overviewFixture) as unknown as ReturnType<
        typeof GuildService.guildControllerGetOverviewV1
      >,
  );
  vi.spyOn(GuildService, "guildControllerGetEmporiumV1").mockImplementation(
    () =>
      Promise.resolve(emporiumFixture) as unknown as ReturnType<
        typeof GuildService.guildControllerGetEmporiumV1
      >,
  );
  vi.spyOn(GuildService, "guildControllerGetPassportV1").mockImplementation(
    () =>
      Promise.resolve(passportFixture) as unknown as ReturnType<
        typeof GuildService.guildControllerGetPassportV1
      >,
  );
}

function emporiumItem(container: HTMLElement, id: string): HTMLElement {
  const item = container.querySelector<HTMLElement>(
    `[data-emporium-item="${id}"]`,
  );

  if (!item) {
    throw new Error(`Emporium item ${id} is not rendered`);
  }

  return item;
}

beforeEach(() => {
  session.userId = "user-1";
  emporiumFixture = buildEmporium();
  passportFixture = PASSPORT;
  overviewFixture = buildOverview("C");
  mockGuildReads();
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
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
  session.userId = "user-1";
});

describe("Lina's Emporium", () => {
  it("confirms price and remaining balance, then sends the listing id and marks it Owned", async () => {
    const purchaseSpy = vi
      .spyOn(GuildService, "guildControllerPurchaseEmporiumItemV1")
      .mockImplementation((body) => {
        emporiumFixture = {
          ...emporiumFixture,
          sealsBalance: 30,
          permanentItems: emporiumFixture.permanentItems.map((item) =>
            item.id === body.emporiumItemId
              ? { ...item, owned: true, canPurchase: false }
              : item,
          ),
        };

        return Promise.resolve({
          itemId: body.emporiumItemId,
          priceSeals: 120,
          sealsBalance: 30,
          reward: OBSIDIAN_REWARD,
          chestResult: null,
          consumables: {
            hourglass: 0,
            reroll_charter: 0,
            extra_slot_permit: 0,
          },
        } satisfies GuildEmporiumPurchaseResponseDto) as unknown as ReturnType<
          typeof GuildService.guildControllerPurchaseEmporiumItemV1
        >;
      });

    const { container } = renderScreen(<GuildEmporium />);

    await screen.findByText("Obsidian Ledger");
    const item = emporiumItem(container, LICENSE_ITEM_ID);
    fireEvent.click(
      within(item).getByRole("button", { name: "Buy: Obsidian Ledger" }),
    );

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Confirm purchase?")).toBeInTheDocument();
    expect(within(dialog).getByText("Obsidian Ledger")).toBeInTheDocument();
    expect(within(dialog).getByText("License theme")).toBeInTheDocument();
    expect(within(dialog).getByText("Epic")).toBeInTheDocument();
    expect(
      dialog.querySelector('[data-reward-art="license_theme"]'),
    ).not.toBeNull();
    expect(within(dialog).getByText("120 Seals")).toBeInTheDocument();
    expect(within(dialog).getByText("30 Seals")).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: "Buy" }));

    await waitFor(() =>
      expect(purchaseSpy).toHaveBeenCalledWith({
        emporiumItemId: LICENSE_ITEM_ID,
      }),
    );
    expect(await screen.findByText("Purchased!")).toBeInTheDocument();

    await waitFor(() =>
      expect(emporiumItem(container, LICENSE_ITEM_ID)).toHaveAttribute(
        "data-emporium-state",
        "owned",
      ),
    );
    const ownedText = within(
      emporiumItem(container, LICENSE_ITEM_ID),
    ).getByText("Owned");
    expect(ownedText).toBeInTheDocument();
    expect(
      within(emporiumItem(container, LICENSE_ITEM_ID)).queryByRole("button", {
        name: "Buy: Obsidian Ledger",
      }),
    ).toBeNull();

    // Correction N3: owning an item is positive, never the warning styling.
    expect(ownedText.className).toContain(economyClasses.itemStateOwned);
    expect(ownedText.className).not.toContain(economyClasses.itemStateWarning);
    expect(ownedText).toHaveAttribute("data-emporium-state-tone", "owned");
  });

  it("shows the monthly purchase count and replaces disabled Buy buttons with status pills", async () => {
    const { container } = renderScreen(<GuildEmporium />);

    await screen.findByText("2 / 5 this month");
    const hourglass = emporiumItem(container, HOURGLASS_ITEM_ID);
    expect(within(hourglass).getByText("2 / 5 this month")).toBeInTheDocument();

    // Correction V7: a counter that is not reached is neutral, not a warning.
    const hourglassState = hourglass.querySelector<HTMLElement>(
      "[data-emporium-state-label]",
    );
    expect(hourglassState?.className).toContain(
      economyClasses.itemStateNeutral,
    );
    expect(hourglassState?.className).not.toContain(
      economyClasses.itemStateWarning,
    );
    expect(hourglassState).toHaveAttribute(
      "data-emporium-state-label",
      "monthly-limit",
    );
    expect(
      within(hourglass).getByRole("button", { name: "Buy: Hourglass" }),
    ).toBeEnabled();

    // A reached limit still blocks, showing the warning counter and static Sold out pill.
    const reached = emporiumItem(container, LIMIT_REACHED_ITEM_ID);
    const reachedState = reached.querySelector<HTMLElement>(
      "[data-emporium-state-label='monthly-limit-reached']",
    );
    expect(within(reached).getByText("2 / 2 this month")).toBeInTheDocument();
    expect(reachedState?.className).toContain(economyClasses.itemStateWarning);
    expect(within(reached).getByText("Sold out")).toBeInTheDocument();
    expect(
      within(reached).queryByRole("button", { name: /Buy:/ }),
    ).toBeNull();

    const notAffordable = emporiumItem(container, TAVERN_LEDGER_ITEM_ID);
    expect(
      within(notAffordable).getByText("Not enough Seals"),
    ).toBeInTheDocument();
    expect(
      within(notAffordable).queryByRole("button", {
        name: "Buy: Tavern Ledger",
      }),
    ).toBeNull();

    const rankLocked = emporiumItem(container, RANK_LOCKED_ITEM_ID);
    expect(within(rankLocked).getByText("Requires Rank A")).toBeInTheDocument();
    expect(
      within(rankLocked).queryByRole("button", {
        name: "Buy: Pumpkin Wax",
      }),
    ).toBeNull();
  });

  it("renders a retryable error state when loading the Emporium fails", async () => {
    let shouldFail = true;
    const emporiumSpy = vi
      .spyOn(GuildService, "guildControllerGetEmporiumV1")
      .mockImplementation(() => {
        if (shouldFail) {
          return Promise.reject(new Error("Emporium down")) as unknown as ReturnType<
            typeof GuildService.guildControllerGetEmporiumV1
          >;
        }
        return Promise.resolve(emporiumFixture) as unknown as ReturnType<
          typeof GuildService.guildControllerGetEmporiumV1
        >;
      });

    renderScreen(<GuildEmporium />);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Emporium down");

    const callsBeforeRetry = emporiumSpy.mock.calls.length;
    shouldFail = false;
    fireEvent.click(within(alert).getByRole("button", { name: "Retry" }));

    expect(await screen.findByText("Obsidian Ledger")).toBeInTheDocument();
    expect(emporiumSpy.mock.calls.length).toBeGreaterThan(callsBeforeRetry);
  });

  it("uses chest tier art for chest listings", async () => {
    const { container } = renderScreen(<GuildEmporium />);

    await screen.findByText("Bronze Chest");
    const chest = emporiumItem(container, CHEST_ITEM_ID);
    expect(
      chest.querySelector('img[src="/img/guild/chest-bronze.svg"]'),
    ).not.toBeNull();
    expect(within(chest).getByText("0 / 3 this month")).toBeInTheDocument();
    expect(
      chest.querySelector<HTMLElement>("[data-emporium-state-label]")
        ?.className,
    ).toContain(economyClasses.itemStateNeutral);
  });
});

describe("Monthly Guild Passport", () => {
  it("claims milestone 4 and shows the Silver Chest and awarded Seals, then marks it claimed", async () => {
    const claimSpy = vi
      .spyOn(GuildService, "guildControllerClaimPassportMilestoneV1")
      .mockImplementation((milestone) => {
        passportFixture = {
          ...passportFixture,
          milestones: passportFixture.milestones.map((item) =>
            item.milestone === Number(milestone)
              ? { ...item, status: GuildPassportMilestoneDto.status.CLAIMED }
              : item,
          ),
        };

        return Promise.resolve(CLAIM_RESULT) as unknown as ReturnType<
          typeof GuildService.guildControllerClaimPassportMilestoneV1
        >;
      });

    const { container } = renderScreen(<GuildPassportCard />);

    await screen.findByText("4 / 6 contracts this month");
    expect(
      container.querySelectorAll('[data-stamp-filled="true"]'),
    ).toHaveLength(4);

    const milestone4 = container.querySelector<HTMLElement>(
      '[data-milestone="4"]',
    );

    if (!milestone4) {
      throw new Error("Milestone 4 is not rendered");
    }

    expect(within(milestone4).getByText("Silver Chest")).toBeInTheDocument();
    expect(within(milestone4).getByText("50 Seals")).toBeInTheDocument();

    const milestone6 = container.querySelector<HTMLElement>(
      '[data-milestone="6"]',
    );
    expect(
      milestone6?.querySelector("[data-contracts-needed]"),
    ).toHaveAttribute("data-contracts-needed", "2");
    expect(
      within(milestone6 as HTMLElement).getByText("2 more contracts needed"),
    ).toBeInTheDocument();

    fireEvent.click(
      within(milestone4).getByRole("button", {
        name: "Claim: Milestone 4",
      }),
    );

    await waitFor(() => expect(claimSpy).toHaveBeenCalledWith("4"));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Silver Chest")).toBeInTheDocument();
    expect(within(dialog).getByText("+80 Seals")).toBeInTheDocument();
    expect(
      within(dialog).getByText(
        "Every cosmetic from this chest was already owned — the cosmetic slot converted to extra XP and Seals.",
      ),
    ).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: "Continue" }));

    await waitFor(() =>
      expect(container.querySelector('[data-milestone="4"]')).toHaveAttribute(
        "data-status",
        "claimed",
      ),
    );
    expect(
      within(
        container.querySelector<HTMLElement>('[data-milestone="4"]')!,
      ).getByText("Claimed"),
    ).toBeInTheDocument();
    expect(
      container.querySelectorAll(`.${economyClasses.milestone}`),
    ).toHaveLength(3);
  });

  it("renders a retryable error state when loading the Passport fails", async () => {
    let shouldFail = true;
    const passportSpy = vi
      .spyOn(GuildService, "guildControllerGetPassportV1")
      .mockImplementation(() => {
        if (shouldFail) {
          return Promise.reject(new Error("Passport down")) as unknown as ReturnType<
            typeof GuildService.guildControllerGetPassportV1
          >;
        }
        return Promise.resolve(passportFixture) as unknown as ReturnType<
          typeof GuildService.guildControllerGetPassportV1
        >;
      });

    renderScreen(<GuildPassportCard />);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Passport down");

    const callsBeforeRetry = passportSpy.mock.calls.length;
    shouldFail = false;
    fireEvent.click(within(alert).getByRole("button", { name: "Retry" }));

    expect(
      await screen.findByText("4 / 6 contracts this month"),
    ).toBeInTheDocument();
    expect(passportSpy.mock.calls.length).toBeGreaterThan(callsBeforeRetry);
  });
});
