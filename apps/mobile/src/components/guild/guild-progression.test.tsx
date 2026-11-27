// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nProvider, type SupportedLanguage } from "@repo/locales";
import type {
  GuildRewardsResponseDto,
  UserGuildRewardDto,
} from "@repo/wrapper/server";
import {
  ApiError,
  GuildAccessResponseDto,
  GuildLicenseDto,
  GuildRewardDescriptorDto,
  GuildService,
  ProfileService,
  type ProfileResponseDto,
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

import guildClasses from "../../../../../packages/ui/src/components/guild/guild.module.css";
import { GuildScene } from "../../../../../packages/ui/src/components/guild/scene/GuildScene";
import { GuildHeader } from "../../../../../packages/ui/src/components/guild/view/GuildHeader";
import { GuildLicenseCard } from "../../../../../packages/ui/src/components/guild/view/GuildLicenseCard";
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

const ACCESS: GuildAccessResponseDto = {
  mode: GuildAccessResponseDto.mode.SUPPORTERS,
  hasAccess: true,
};

const LICENSE: GuildLicenseDto = {
  licenseNumber: 47,
  rank: GuildLicenseDto.rank.S,
  xp: 9200,
  currentRankMinXp: 7500,
  nextRank: null,
  nextRankXp: null,
  xpToNextRank: 0,
  memberSince: "2024-05-01T00:00:00.000Z",
  equippedTitleKey: null,
  equippedFrameKey: null,
  sealsBalance: 150,
  prestigeLevel: 1,
  prestigeXpIntoCurrent: 800,
  xpToNextPrestige: 1700,
  perks: {
    maxActiveContracts: 4,
    weeklyRerolls: 2,
    monthlyExpedition: true,
    monthlyExpeditionRankS: true,
    monthlyFreeHourglass: 1,
    legendaryContracts: true,
  },
  equippedLicenseThemeKey: "license_obsidian_ledger",
  equippedStampStyleKey: "stamp_gold_seal",
  equippedDecorKeys: ["decor_mug_of_ale"],
  showcaseBadgeIds: ["guild-archaeologist"],
  stats: { finishedGames: 47, backlogGames: 23, reviewsCount: 12 },
};

function reward(
  id: number,
  key: string,
  kind: GuildRewardDescriptorDto.kind,
  rarity: GuildRewardDescriptorDto.rarity,
  achievementId: string | null = null,
): UserGuildRewardDto {
  return {
    id,
    reward: {
      id: `reward-${id}`,
      key,
      kind,
      achievementId,
      inChestPool: true,
      chestBonusXp: 0,
      chestBonusSeals: 0,
      rarity,
      consumableKey: null,
    },
    sourceContractId: null,
    unlockedAt: "2026-11-21T12:00:00.000Z",
  };
}

const REWARDS: GuildRewardsResponseDto = {
  unlockedRewards: [
    reward(
      1,
      "badge_archaeologist",
      GuildRewardDescriptorDto.kind.BADGE,
      GuildRewardDescriptorDto.rarity.COMMON,
      "guild-archaeologist",
    ),
    reward(
      2,
      "title_chronist",
      GuildRewardDescriptorDto.kind.TITLE,
      GuildRewardDescriptorDto.rarity.COMMON,
    ),
    reward(
      3,
      "frame_lantern_glow",
      GuildRewardDescriptorDto.kind.AVATAR_FRAME,
      GuildRewardDescriptorDto.rarity.RARE,
    ),
    reward(
      4,
      "license_obsidian_ledger",
      GuildRewardDescriptorDto.kind.LICENSE_THEME,
      GuildRewardDescriptorDto.rarity.EPIC,
    ),
    reward(
      5,
      "stamp_gold_seal",
      GuildRewardDescriptorDto.kind.STAMP_STYLE,
      GuildRewardDescriptorDto.rarity.EPIC,
    ),
    reward(
      6,
      "decor_mug_of_ale",
      GuildRewardDescriptorDto.kind.TAVERN_DECOR,
      GuildRewardDescriptorDto.rarity.COMMON,
    ),
    reward(
      7,
      "decor_sleeping_cat",
      GuildRewardDescriptorDto.kind.TAVERN_DECOR,
      GuildRewardDescriptorDto.rarity.EPIC,
    ),
    reward(
      9,
      "decor_oak_barrel",
      GuildRewardDescriptorDto.kind.TAVERN_DECOR,
      GuildRewardDescriptorDto.rarity.UNCOMMON,
    ),
    reward(
      10,
      "decor_ancient_globe",
      GuildRewardDescriptorDto.kind.TAVERN_DECOR,
      GuildRewardDescriptorDto.rarity.RARE,
    ),
    reward(
      11,
      "decor_herb_planter",
      GuildRewardDescriptorDto.kind.TAVERN_DECOR,
      GuildRewardDescriptorDto.rarity.UNCOMMON,
    ),
  ],
  equippedTitleKey: null,
  equippedFrameKey: null,
  equippedLicenseThemeKey: "license_obsidian_ledger",
  equippedStampStyleKey: "stamp_gold_seal",
  equippedDecorKeys: ["decor_mug_of_ale"],
  showcaseBadgeIds: [],
  sealsBalance: 150,
  consumables: { hourglass: 2, reroll_charter: 1, extra_slot_permit: 1 },
};

const PERMIT_STATUS = {
  weekStart: "2026-11-23",
  activeThisWeek: true,
  expiresAt: "2026-11-30T03:00:00.000Z",
  remainingPermits: 0,
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
      queries: { retry: false },
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

let rewardsFixture: GuildRewardsResponseDto;

function mockGuildApi() {
  vi.spyOn(GuildService, "guildControllerGetAccessV1").mockResolvedValue(
    ACCESS,
  );
  vi.spyOn(GuildService, "guildControllerGetRewardsV1").mockImplementation(
    () =>
      Promise.resolve(rewardsFixture) as unknown as ReturnType<
        typeof GuildService.guildControllerGetRewardsV1
      >,
  );
}

beforeEach(() => {
  session.userId = "user-1";
  rewardsFixture = REWARDS;
  mockGuildApi();
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
});

describe("GuildHeader prestige and Seals", () => {
  it("shows one Prestige star and an 800 / 2500 bar at Prestige 1", () => {
    const { container } = renderScreen(
      <GuildHeader
        license={LICENSE}
        nextRefreshAt="2026-11-30T03:00:00.000Z"
      />,
    );

    expect(screen.getByText("RANK S")).toBeInTheDocument();
    expect(screen.getByText("Prestige 1")).toBeInTheDocument();
    expect(screen.getByText("800 / 2,500 XP")).toBeInTheDocument();
    expect(
      container.querySelectorAll('img[src="/img/guild/prestige-star.svg"]'),
    ).toHaveLength(1);

    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("data-prestige-bar", "true");
    expect(bar).toHaveAttribute("aria-valuenow", "32");
  });

  it("shows the Seals pill with the balance from the License", () => {
    const { container } = renderScreen(
      <GuildHeader
        license={LICENSE}
        nextRefreshAt="2026-11-30T03:00:00.000Z"
      />,
    );

    const pill = container.querySelector<HTMLElement>("[data-seals-balance]");

    expect(pill).toHaveAttribute("data-seals-balance", "150");
    expect(within(pill as HTMLElement).getByText("150")).toBeInTheDocument();
    expect(pill?.querySelector("img")).toHaveAttribute(
      "src",
      "/img/guild/seal.svg",
    );
  });

  it("keeps the rank bar when Prestige is not active", () => {
    renderScreen(
      <GuildHeader
        license={{ ...LICENSE, rank: GuildLicenseDto.rank.C, prestigeLevel: 0 }}
        nextRefreshAt="2026-11-30T03:00:00.000Z"
      />,
    );

    expect(screen.queryByText(/Prestige/)).toBeNull();
    expect(screen.getByRole("progressbar")).not.toHaveAttribute(
      "data-prestige-bar",
    );
  });
});

describe("GuildLicenseCard progression", () => {
  it("applies the License theme, stamp style, showcase and perks without duplicate Seals or XP bars", async () => {
    const { container } = renderScreen(<GuildLicenseCard license={LICENSE} />);

    const card = container.querySelector<HTMLElement>("[data-license-theme]");

    expect(card).toHaveAttribute(
      "data-license-theme",
      "license_obsidian_ledger",
    );
    expect(card?.className).toContain(
      guildClasses["licenseTheme-license_obsidian_ledger"],
    );

    const stamp = container.querySelector<HTMLElement>("[data-stamp-style]");

    expect(stamp).toHaveAttribute("data-stamp-style", "stamp_gold_seal");
    expect(stamp?.className).toContain(
      guildClasses["stampStyle-stamp_gold_seal"],
    );

    expect(screen.queryByLabelText("150 Seals")).toBeNull();
    expect(screen.queryByRole("progressbar")).toBeNull();
    expect(screen.getByText("Prestige 1")).toBeInTheDocument();
    expect(
      container.querySelectorAll('img[src="/img/guild/prestige-star.svg"]'),
    ).toHaveLength(1);

    // The showcase resolves the badge label through the rewards inventory.
    expect(await screen.findByText("Archaeologist")).toBeInTheDocument();
    const showcase = screen.getByLabelText("Trophy showcase");
    expect(within(showcase).getAllByRole("listitem")).toHaveLength(3);

    expect(screen.getByText("Perks")).toBeInTheDocument();
    expect(screen.getByText("Up to 4 active contracts")).toBeInTheDocument();
    expect(screen.getByText("2 free weekly rerolls")).toBeInTheDocument();
    expect(screen.getByText("Legendary contracts")).toBeInTheDocument();
  });

  it("renders the player's real GameNode avatar when available and falls back to the silhouette otherwise", async () => {
    vi.spyOn(
      ProfileService,
      "profileControllerFindOneByIdV1",
    ).mockResolvedValueOnce({
      userId: "user-1",
      username: "cassi",
      avatar: {
        id: 1,
        filename: "avatar-123",
        extension: "png",
      },
      avatarVideo: null,
    } as unknown as ProfileResponseDto);

    const { container } = renderScreen(<GuildLicenseCard license={LICENSE} />);

    await waitFor(() => {
      const avatarImg = container.querySelector<HTMLImageElement>(
        'img[src*="avatar-123.png"]',
      );
      expect(avatarImg).not.toBeNull();
    });

    cleanup();

    vi.spyOn(
      ProfileService,
      "profileControllerFindOneByIdV1",
    ).mockResolvedValueOnce({
      userId: "user-1",
      username: "cassi",
      avatar: null,
      avatarVideo: null,
    } as unknown as ProfileResponseDto);

    const fallback = renderScreen(<GuildLicenseCard license={LICENSE} />);
    expect(
      fallback.container.querySelector('img[src="/img/guild/silhouette.svg"]'),
    ).not.toBeNull();
  });

  it("shows the empty showcase copy when no badge is displayed", async () => {
    renderScreen(
      <GuildLicenseCard license={{ ...LICENSE, showcaseBadgeIds: [] }} />,
    );

    expect(
      await screen.findByText("No trophies on display yet."),
    ).toBeInTheDocument();
    const showcase = screen.getByLabelText("Trophy showcase");
    expect(within(showcase).getAllByRole("listitem")).toHaveLength(3);
  });
});

describe("GuildRewardsPanel decor and showcase", () => {
  it("adds a decor item keeping the equipped order in the request body", async () => {
    const update = vi
      .spyOn(GuildService, "guildControllerUpdateCosmeticsV1")
      .mockResolvedValue({
        guildTitleKey: null,
        guildFrameKey: null,
        equippedLicenseThemeKey: "license_obsidian_ledger",
        equippedStampStyleKey: "stamp_gold_seal",
        equippedDecorKeys: ["decor_mug_of_ale", "decor_sleeping_cat"],
        showcaseBadgeIds: [],
      });

    renderScreen(<GuildRewardsPanel />);

    fireEvent.click(
      await screen.findByRole("button", { name: "Add: Sleeping Cat" }),
    );

    await waitFor(() =>
      expect(update).toHaveBeenCalledWith({
        equippedDecorKeys: ["decor_mug_of_ale", "decor_sleeping_cat"],
      }),
    );
  });

  it("disables adding a fifth decor item and shows the Up to 4 hint", async () => {
    rewardsFixture = {
      ...REWARDS,
      equippedDecorKeys: [
        "decor_mug_of_ale",
        "decor_sleeping_cat",
        "decor_oak_barrel",
        "decor_ancient_globe",
      ],
    };

    renderScreen(<GuildRewardsPanel />);

    expect(
      await screen.findByText("Up to 4 on the counter"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add: Herb Planter" }),
    ).toBeDisabled();
  });

  it("limits the Trophy Showcase to 3 badges", async () => {
    rewardsFixture = {
      ...REWARDS,
      unlockedRewards: [
        reward(
          1,
          "badge_archaeologist",
          GuildRewardDescriptorDto.kind.BADGE,
          GuildRewardDescriptorDto.rarity.COMMON,
          "guild-archaeologist",
        ),
        reward(
          2,
          "badge_future_path",
          GuildRewardDescriptorDto.kind.BADGE,
          GuildRewardDescriptorDto.rarity.RARE,
          "guild-future-path",
        ),
        reward(
          3,
          "badge_future_lore",
          GuildRewardDescriptorDto.kind.BADGE,
          GuildRewardDescriptorDto.rarity.EPIC,
          "guild-future-lore",
        ),
        reward(
          4,
          "badge_future_raid",
          GuildRewardDescriptorDto.kind.BADGE,
          GuildRewardDescriptorDto.rarity.LEGENDARY,
          "guild-future-raid",
        ),
      ],
      equippedDecorKeys: [],
      showcaseBadgeIds: [
        "guild-archaeologist",
        "guild-future-path",
        "guild-future-lore",
      ],
    };

    renderScreen(<GuildRewardsPanel />);

    expect(await screen.findByText("Up to 3 badges")).toBeInTheDocument();

    const section = document.querySelector<HTMLDetailsElement>(
      '[data-rewards-section="showcase"]',
    );

    expect(section?.open).toBe(false);
    fireEvent.click(
      within(section as HTMLElement).getByText("Trophy showcase"),
    );
    expect(section?.open).toBe(true);

    const fourthRow = document.querySelector<HTMLElement>(
      '[data-reward-key="badge_future_raid"]',
    );

    expect(fourthRow).not.toBeNull();
    expect(
      within(fourthRow as HTMLElement).getByRole("button", {
        name: "Add: Badge",
      }),
    ).toBeDisabled();
  });

  it("sends only the showcase field when adding an owned badge", async () => {
    const update = vi
      .spyOn(GuildService, "guildControllerUpdateCosmeticsV1")
      .mockResolvedValue({
        guildTitleKey: null,
        guildFrameKey: null,
        equippedLicenseThemeKey: "license_obsidian_ledger",
        equippedStampStyleKey: "stamp_gold_seal",
        equippedDecorKeys: ["decor_mug_of_ale"],
        showcaseBadgeIds: ["guild-archaeologist"],
      });

    renderScreen(<GuildRewardsPanel />);

    const section = (await screen.findByText("Trophy showcase")).closest(
      "details",
    ) as HTMLDetailsElement | null;

    expect(section?.open).toBe(false);
    fireEvent.click(
      within(section as HTMLElement).getByText("Trophy showcase"),
    );
    expect(section?.open).toBe(true);

    fireEvent.click(
      await screen.findByRole("button", { name: "Add: Archaeologist" }),
    );

    await waitFor(() =>
      expect(update).toHaveBeenCalledWith({
        showcaseBadgeIds: ["guild-archaeologist"],
      }),
    );
  });
});

describe("GuildRewardsPanel single-select cosmetics", () => {
  it("collapses the single-select sections, keeping decor and consumables open", async () => {
    renderScreen(<GuildRewardsPanel />);

    await screen.findByText("Titles");

    for (const id of [
      "title",
      "avatar_frame",
      "license_theme",
      "stamp_style",
      "showcase",
    ]) {
      const section = document.querySelector<HTMLDetailsElement>(
        `[data-rewards-section="${id}"]`,
      );

      expect(section).not.toBeNull();
      expect(section?.open).toBe(false);
    }

    for (const id of ["tavern_decor", "consumable"]) {
      const section = document.querySelector<HTMLDetailsElement>(
        `[data-rewards-section="${id}"]`,
      );

      expect(section).not.toBeNull();
      expect(section?.open).toBe(true);
    }

    const licenseSection = document.querySelector<HTMLElement>(
      '[data-rewards-section="license_theme"]',
    );

    expect(
      licenseSection?.querySelector("[data-rewards-count]"),
    ).toHaveTextContent("1");
    expect(
      licenseSection?.querySelector("[data-equipped-label]"),
    ).toHaveTextContent("Obsidian Ledger");
  });

  it("opens a collapsed section before using its Equip button", async () => {
    const update = vi
      .spyOn(GuildService, "guildControllerUpdateCosmeticsV1")
      .mockResolvedValue({
        guildTitleKey: "title_chronist",
        guildFrameKey: null,
        equippedLicenseThemeKey: "license_obsidian_ledger",
        equippedStampStyleKey: "stamp_gold_seal",
        equippedDecorKeys: ["decor_mug_of_ale"],
        showcaseBadgeIds: [],
      });

    renderScreen(<GuildRewardsPanel />);

    const section = (await screen.findByText("Titles")).closest(
      "details",
    ) as HTMLDetailsElement | null;

    expect(section).not.toBeNull();
    expect(section?.open).toBe(false);

    fireEvent.click(within(section as HTMLElement).getByText("Titles"));
    expect(section?.open).toBe(true);

    fireEvent.click(
      within(section as HTMLElement).getByRole("button", {
        name: "Equip: Chronicler",
      }),
    );

    await waitFor(() =>
      expect(update).toHaveBeenCalledWith({ guildTitleKey: "title_chronist" }),
    );
  });

  it("clears the License theme with null", async () => {
    const update = vi
      .spyOn(GuildService, "guildControllerUpdateCosmeticsV1")
      .mockResolvedValue({
        guildTitleKey: null,
        guildFrameKey: null,
        equippedLicenseThemeKey: null,
        equippedStampStyleKey: "stamp_gold_seal",
        equippedDecorKeys: ["decor_mug_of_ale"],
        showcaseBadgeIds: [],
      });

    renderScreen(<GuildRewardsPanel />);

    const section = (await screen.findByText("License themes")).closest(
      "details",
    ) as HTMLDetailsElement | null;

    expect(section?.open).toBe(false);
    fireEvent.click(within(section as HTMLElement).getByText("License themes"));
    expect(section?.open).toBe(true);

    fireEvent.click(
      await screen.findByRole("button", {
        name: "Unequip: Obsidian Ledger",
      }),
    );

    await waitFor(() =>
      expect(update).toHaveBeenCalledWith({
        equippedLicenseThemeKey: null,
      }),
    );
  });

  it("keeps the previous selection when the server rejects the change", async () => {
    vi.spyOn(
      GuildService,
      "guildControllerUpdateCosmeticsV1",
    ).mockRejectedValue(
      apiError(400, {
        message: "Too many entries.",
        code: "guild_cosmetic_limit_exceeded",
      }),
    );

    renderScreen(<GuildRewardsPanel />);

    fireEvent.click(
      await screen.findByRole("button", { name: "Add: Sleeping Cat" }),
    );

    await waitFor(() =>
      expect(
        document.querySelector('[data-reward-key="decor_sleeping_cat"]'),
      ).toHaveAttribute("data-equipped", "false"),
    );
    expect(
      document.querySelector('[data-reward-key="decor_mug_of_ale"]'),
    ).toHaveAttribute("data-equipped", "true");
  });
});

describe("GuildRewardsPanel consumables", () => {
  it("shows the consumable counts and their effects", async () => {
    renderScreen(<GuildRewardsPanel />);

    expect(await screen.findByText("Hourglass")).toBeInTheDocument();
    expect(screen.getByText("Reroll Charter")).toBeInTheDocument();
    expect(screen.getByText("Extra Slot Permit")).toBeInTheDocument();
    expect(
      document.querySelector('[data-consumable-count="hourglass"]'),
    ).toHaveTextContent("2");
    expect(
      document.querySelector('[data-consumable-count="reroll_charter"]'),
    ).toHaveTextContent("1");
    expect(
      screen.getByText(
        "Extend one active contract by 7 days (once per contract).",
      ),
    ).toBeInTheDocument();
  });

  it("activates an Extra Slot Permit after confirmation and shows the active-until date", async () => {
    const activate = vi
      .spyOn(GuildService, "guildControllerActivateExtraSlotPermitV1")
      .mockResolvedValue(PERMIT_STATUS);

    renderScreen(<GuildRewardsPanel />);

    fireEvent.click(await screen.findByRole("button", { name: "Activate" }));

    const dialog = await screen.findByRole("dialog", { name: "Activate" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Activate" }));

    await waitFor(() => expect(activate).toHaveBeenCalledTimes(1));
    expect(await screen.findByText(/Active until/)).toBeInTheDocument();
    expect(
      document.querySelector('[data-consumable-count="extra_slot_permit"]'),
    ).toHaveTextContent("0");
    expect(screen.getByRole("button", { name: "Activate" })).toBeDisabled();
  });
});

describe("GuildScene tavern decor", () => {
  const DECOR_KEYS = [
    "decor_mug_of_ale",
    "decor_sleeping_cat",
    "decor_oak_barrel",
    "decor_from_the_future",
    "decor_herb_planter",
  ];

  it("draws four decor assets on the desktop counter, generic for unknown keys", () => {
    const { container } = renderScreen(
      <GuildScene
        variant="desktop"
        pose="neutral"
        isTalking={false}
        showAlert={false}
        decorKeys={DECOR_KEYS}
      />,
    );

    const slots = [
      ...container.querySelectorAll<HTMLElement>("[data-decor-key]"),
    ];

    expect(slots).toHaveLength(4);
    expect(
      slots.map((slot) => slot.querySelector("img")?.getAttribute("src")),
    ).toEqual([
      "/img/guild/mug.svg",
      "/img/guild/decor-sleeping-cat.svg",
      "/img/guild/decor-oak-barrel.svg",
      "/img/guild/decor-generic.svg",
    ]);
    expect(slots.map((slot) => slot.style.left)).toEqual([
      "620px",
      "700px",
      "780px",
      "860px",
    ]);
  });

  it("draws only the first two decor assets on the mobile composition", () => {
    const { container } = renderScreen(
      <GuildScene
        variant="mobile"
        pose="neutral"
        isTalking={false}
        showAlert={false}
        decorKeys={DECOR_KEYS}
      />,
    );

    const slots = [
      ...container.querySelectorAll<HTMLElement>("[data-decor-key]"),
    ];

    expect(slots).toHaveLength(2);
    expect(
      slots.map((slot) => slot.querySelector("img")?.getAttribute("src")),
    ).toEqual(["/img/guild/mug.svg", "/img/guild/decor-sleeping-cat.svg"]);
    expect(slots.map((slot) => slot.style.left)).toEqual(["110px", "170px"]);
  });

  it("renders no decor when the License has none equipped", () => {
    const { container } = renderScreen(
      <GuildScene
        variant="desktop"
        pose="neutral"
        isTalking={false}
        showAlert={false}
      />,
    );

    expect(container.querySelectorAll("[data-decor-key]")).toHaveLength(0);
  });
});
