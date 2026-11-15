// @vitest-environment jsdom
import React, { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  AchievementEventDto,
  AchievementIconDto,
  AchievementTierV2Dto,
  AchievementV2Dto,
} from "../../../../../packages/wrapper/src/server";
import {
  buildFeatsModel,
  filterFeats,
  type FeatProgress,
} from "../../../../../packages/ui/src/components/achievement/util/feats";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";
import ptBR from "../../../../../packages/locales/src/translations/json/pt-BR.json";
import { FeatsHeader } from "../../../../../packages/ui/src/components/achievement/feats/FeatsHeader";
import { FeatsProfileCard } from "../../../../../packages/ui/src/components/achievement/feats/FeatsProfileCard";
import { FeatsSummaryCard } from "../../../../../packages/ui/src/components/achievement/feats/FeatsSummaryCard";
import { FeatsAlmostThere } from "../../../../../packages/ui/src/components/achievement/feats/FeatsAlmostThere";
import { FeatsEvents } from "../../../../../packages/ui/src/components/achievement/feats/FeatsEvents";
import {
  FeatsFilters,
  type FeatsFiltersValue,
} from "../../../../../packages/ui/src/components/achievement/feats/FeatsFilters";
import { FeatsSection } from "../../../../../packages/ui/src/components/achievement/feats/FeatsSection";

const mocks = vi.hoisted(() => ({
  profile: undefined as Record<string, unknown> | undefined,
  level: undefined as Record<string, unknown> | undefined,
}));

function translate(key: string, options?: Record<string, unknown>): string {
  const lookup = (path: string): unknown => {
    let value: unknown = ptBR;
    for (const part of path.split(".")) {
      value =
        typeof value === "object" && value !== null
          ? (value as Record<string, unknown>)[part]
          : undefined;
    }
    return value;
  };

  let value = lookup(key);
  if (typeof value !== "string" && options?.count !== undefined) {
    value = lookup(`${key}_${options.count === 1 ? "one" : "other"}`);
  }
  if (typeof value !== "string") return key;

  return value.replace(/\{\{(\w+)\}\}/g, (_, name) =>
    String(options?.[name] ?? ""),
  );
}

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({
    t: translate,
    i18n: { language: "pt-BR", resolvedLanguage: "pt-BR" },
  }),
  useI18nContext: () => ({
    language: "pt-BR",
    resolvedLanguage: "pt-BR",
    setLanguage: () => {},
    supportedLanguages: ["en", "pt-BR"],
  }),
}));

vi.mock(
  "../../../../../packages/ui/src/components/profile/hooks/useUserProfile",
  () => ({
    useUserProfile: () => ({ data: mocks.profile }),
  }),
);

vi.mock(
  "../../../../../packages/ui/src/components/user-level/hooks/useUserLevel",
  () => ({
    useUserLevel: () => ({ data: mocks.level }),
  }),
);

vi.mock(
  "../../../../../packages/ui/src/components/general/avatar/UserAvatar",
  () => ({
    UserAvatar: ({ userId }: { userId?: string }) => (
      <div data-testid={"user-avatar"} data-user-id={userId} />
    ),
  }),
);

const NOW = Date.parse("2026-11-14T12:00:00Z");

const tier = (
  level: number,
  threshold: number,
  expReward: number,
): AchievementTierV2Dto => ({
  level,
  threshold,
  expReward,
  obtainedCount: 0,
  rarity: 0.1,
});

const feat = (
  id: string,
  overrides: Partial<AchievementV2Dto> = {},
): AchievementV2Dto => ({
  id,
  name: id,
  description: `${id} description`,
  category: 0 as AchievementV2Dto["category"],
  criteria: null,
  isHidden: false,
  metric: null,
  icon: { kind: AchievementIconDto.kind.GLYPH, name: "star" },
  event: null,
  startsAt: null,
  endsAt: null,
  tiers: [tier(1, 10, 10)],
  ...overrides,
});

const event = (
  id: string,
  name: string,
  startsAt: string,
  endsAt: string,
): AchievementEventDto => ({
  id,
  slug: id,
  name,
  description: `${name} description`,
  startsAt,
  endsAt,
});

const progress = (
  achievementId: string,
  overrides: Partial<FeatProgress> = {},
): FeatProgress => ({
  achievementId,
  value: 0,
  tier: 0,
  nextThreshold: null,
  obtainedTiers: [],
  ...overrides,
});

function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: false } },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      <MantineProvider>
        <UIProvider
          presenters={{
            Link: ({ href, children: linkChildren, ...others }) => (
              <a href={href} {...others}>
                {linkChildren}
              </a>
            ),
          }}
          hooks={{
            useRouter: () => ({
              pathname: "/feats/user-1",
              asPath: "/feats/user-1",
              back: () => {},
              push: async () => {},
              query: new URLSearchParams(),
            }),
          }}
        >
          {children}
        </UIProvider>
      </MantineProvider>
    </QueryClientProvider>
  );
}

const renderWithProviders = (ui: React.ReactElement) =>
  render(ui, { wrapper: Providers });

beforeEach(() => {
  mocks.profile = undefined;
  mocks.level = undefined;
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
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

describe("FeatsHeader", () => {
  it("links the breadcrumb to the profile and renders the translated heading", () => {
    renderWithProviders(<FeatsHeader userId={"user-1"} />);

    const breadcrumb = screen.getByRole("link", { name: "Perfil" });
    expect(breadcrumb.getAttribute("href")).toBe("/profile/user-1");
    expect(
      screen.getByRole("heading", { level: 1, name: "Feitos" }),
    ).toBeTruthy();
    expect(
      screen.getByText(
        "As conquistas do GameNode. Cada nível dá XP e sobe o seu nível de perfil.",
      ),
    ).toBeTruthy();
  });
});

describe("FeatsProfileCard", () => {
  it("shows the current level, the XP missing for the next level and the join date", () => {
    mocks.level = {
      currentLevel: 14,
      currentLevelExp: 2340,
      levelUpExpCost: 2800,
    };
    mocks.profile = {
      username: "ThePrado",
      createdAt: "2025-11-02T12:00:00.000Z",
    };

    renderWithProviders(<FeatsProfileCard userId={"user-1"} />);

    expect(screen.getAllByText("Nível 14").length).toBeGreaterThan(0);
    expect(screen.getByText("faltam 460 XP para o 15")).toBeTruthy();
    expect(screen.getByText("2.340 / 2.800 XP")).toBeTruthy();
    expect(screen.getByText("Membro desde 2 de nov. de 2025")).toBeTruthy();
    expect(screen.getByTestId("user-avatar").dataset.userId).toBe("user-1");
  });
});

describe("FeatsSummaryCard", () => {
  const buildSummaryModel = () => {
    const achievements = [
      feat("backlog-dragon", {
        name: "Backlog Dragon",
        tiers: [tier(1, 10, 10), tier(2, 25, 25), tier(3, 50, 50)],
      }),
      feat("test-lab", { name: "Test Lab", tiers: [tier(1, 10, 40)] }),
      ...Array.from({ length: 22 }, (_, index) =>
        feat(`locked-${index}`, { name: `Locked ${index}` }),
      ),
    ];

    return buildFeatsModel({
      achievements,
      progress: [
        progress("backlog-dragon", { value: 50, tier: 3 }),
        progress("test-lab", { value: 10, tier: 1 }),
      ],
      now: NOW,
    });
  };

  it("shows the three summary numbers, the featured feat and the owner actions", () => {
    const model = buildSummaryModel();
    const onPickFeatured = vi.fn();
    const onRedeem = vi.fn();

    renderWithProviders(
      <FeatsSummaryCard
        summary={model.summary}
        featuredItem={model.items[0]}
        isOwner
        onPickFeatured={onPickFeatured}
        onRedeem={onRedeem}
      />,
    );

    expect(
      screen.getByText(
        (_, element) =>
          element?.tagName === "P" && element.textContent === "2 / 24",
      ),
    ).toBeTruthy();
    expect(screen.getByText("4")).toBeTruthy();
    expect(screen.getByText("125")).toBeTruthy();
    expect(screen.getByText("Backlog Dragon · Nível 3")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Trocar" }));
    expect(onPickFeatured).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Resgatar um código" }));
    expect(onRedeem).toHaveBeenCalledTimes(1);
  });

  it("hides the empty slot and the redeem action from visitors", () => {
    const model = buildSummaryModel();

    renderWithProviders(
      <FeatsSummaryCard
        summary={model.summary}
        isOwner={false}
        onPickFeatured={() => {}}
        onRedeem={() => {}}
      />,
    );

    expect(screen.queryByText("Nenhum feito em destaque")).toBeNull();
    expect(screen.queryByText("Trocar")).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Resgatar um código" }),
    ).toBeNull();
  });

  it("shows a visitor the featured feat without owner actions", () => {
    const model = buildSummaryModel();

    renderWithProviders(
      <FeatsSummaryCard
        summary={model.summary}
        featuredItem={model.items[0]}
        isOwner={false}
        onPickFeatured={() => {}}
        onRedeem={() => {}}
      />,
    );

    expect(screen.getByText("Backlog Dragon · Nível 3")).toBeTruthy();
    expect(screen.queryByText("Trocar")).toBeNull();
  });
});

describe("FeatsAlmostThere", () => {
  it("renders up to three ranked items and opens the tiers of the selected one", () => {
    const model = buildFeatsModel({
      achievements: [
        feat("take-off", { name: "Take Off", tiers: [tier(1, 10, 50)] }),
        feat("critics-corner", {
          name: "Critic's Corner",
          tiers: [tier(1, 5, 20), tier(2, 10, 40)],
        }),
        feat("roll-credits", {
          name: "Roll Credits",
          tiers: [tier(1, 10, 30), tier(2, 25, 60)],
        }),
        feat("far-away", { name: "Far Away", tiers: [tier(1, 50, 100)] }),
      ],
      progress: [
        progress("take-off", { value: 8, tier: 0, nextThreshold: 10 }),
        progress("critics-corner", { value: 4, tier: 1, nextThreshold: 5 }),
        progress("roll-credits", { value: 21, tier: 1, nextThreshold: 25 }),
        progress("far-away", { value: 2, tier: 0, nextThreshold: 50 }),
      ],
      now: NOW,
    });

    expect(model.almostThere.map((item) => item.achievement.id)).toEqual([
      "roll-credits",
      "take-off",
      "critics-corner",
    ]);

    const onOpenTiers = vi.fn();
    renderWithProviders(
      <FeatsAlmostThere items={model.almostThere} onOpenTiers={onOpenTiers} />,
    );

    const cards = screen.getAllByRole("button");
    expect(cards).toHaveLength(3);
    expect(cards[0].textContent).toContain("Roll Credits");
    expect(cards[2].textContent).toContain("Critic's Corner");

    fireEvent.click(cards[0]);
    expect(onOpenTiers).toHaveBeenCalledWith(
      expect.objectContaining({
        achievement: expect.objectContaining({ id: "roll-credits" }),
      }),
    );
  });

  it("renders nothing when no feat qualifies", () => {
    const { container } = renderWithProviders(
      <FeatsAlmostThere items={[]} onOpenTiers={() => {}} />,
    );

    expect(container.querySelector(".mantine-Stack-root")).toBeNull();
  });
});

describe("FeatsEvents", () => {
  const buildEventsModel = () => {
    const pastWithFeat = event(
      "awards-2025",
      "Prêmios GameNode 2025",
      "2025-01-01T00:00:00.000Z",
      "2025-11-01T00:00:00.000Z",
    );
    const pastWithoutFeat = event(
      "retired-event",
      "Evento aposentado",
      "2024-01-01T00:00:00.000Z",
      "2024-06-01T00:00:00.000Z",
    );
    const activeEvent = event(
      "active-event",
      "Evento ativo",
      "2026-01-01T00:00:00.000Z",
      "2027-01-01T00:00:00.000Z",
    );

    return buildFeatsModel({
      achievements: [
        feat("award-feat", {
          name: "Voto de ouro",
          event: pastWithFeat,
          tiers: [
            tier(1, 10, 10),
            tier(2, 25, 20),
            tier(3, 100, 100),
            tier(4, 250, 200),
          ],
        }),
        feat("missed-feat", {
          name: "Feito perdido",
          event: pastWithoutFeat,
        }),
        feat("active-feat", { name: "Feito ativo", event: activeEvent }),
      ],
      progress: [
        progress("award-feat", {
          value: 30,
          tier: 2,
          nextThreshold: 100,
          obtainedTiers: [
            { level: 1, obtainedAt: "2025-03-01T12:00:00.000Z" },
            { level: 2, obtainedAt: "2025-06-01T12:00:00.000Z" },
          ],
        }),
      ],
      now: NOW,
    });
  };

  it("lists active and obtained ended events and opens every ended event", async () => {
    const model = buildEventsModel();

    expect(model.events.map((group) => group.id)).toEqual([
      "active-event",
      "awards-2025",
    ]);

    renderWithProviders(
      <FeatsEvents events={model.events} pastEvents={model.pastEvents} />,
    );

    expect(screen.getByText("Evento ativo")).toBeTruthy();
    expect(screen.getByText("Prêmios GameNode 2025")).toBeTruthy();
    expect(screen.getByText("Evento encerrado")).toBeTruthy();
    expect(screen.getByText("Obtida · +30 XP")).toBeTruthy();
    expect(screen.queryByText("Evento aposentado")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /Eventos passados/ }));

    const dialog = await screen.findByRole("dialog");
    expect(
      within(dialog).getByText(
        "Feitos de eventos encerrados não podem mais ser obtidos.",
      ),
    ).toBeTruthy();
    expect(within(dialog).getByText("Evento aposentado")).toBeTruthy();
    expect(within(dialog).getByText("Feito perdido")).toBeTruthy();

    // Partial feat: every obtained tier with its date, then the remaining ones as unavailable.
    expect(within(dialog).getByText("Obtido em 01/03/2025")).toBeTruthy();
    expect(within(dialog).getByText("Obtido em 01/06/2025")).toBeTruthy();
    // The partial feat keeps tiers 3 and 4 visible as unavailable (plus the missed feat's only tier).
    expect(within(dialog).getByText("Nível 3")).toBeTruthy();
    expect(within(dialog).getByText("Nível 4")).toBeTruthy();
    expect(
      within(dialog).getAllByText("Não é mais possível obter"),
    ).toHaveLength(3);
  });

  it("hides the section when there are no rows", () => {
    const { container } = renderWithProviders(
      <FeatsEvents events={[]} pastEvents={[]} />,
    );

    expect(container.querySelector(".mantine-Stack-root")).toBeNull();
  });
});

describe("FeatsFilters and FeatsSection", () => {
  const buildFilterModel = () =>
    buildFeatsModel({
      achievements: [
        feat("follow-locked", {
          name: "Take Off",
          category: 1 as AchievementV2Dto["category"],
        }),
        feat("follow-obtained", {
          name: "Follower veteran",
          category: 1 as AchievementV2Dto["category"],
        }),
        feat("review-locked", {
          name: "Review rookie",
          category: 2 as AchievementV2Dto["category"],
        }),
        feat("secret-feat", {
          name: null,
          description: null,
          icon: null,
          isHidden: true,
        }),
      ],
      progress: [progress("follow-obtained", { value: 10, tier: 1 })],
      now: NOW,
    });

  function FiltersHarness({
    items,
  }: {
    items: ReturnType<typeof buildFilterModel>["items"];
  }) {
    const [value, setValue] = useState<FeatsFiltersValue>({
      category: "all",
      query: "",
      status: "all",
    });

    const filtered = filterFeats(items, value);
    const obtained = filtered.filter((item) => (item.progress?.tier ?? 0) > 0);
    const notObtained = filtered.filter(
      (item) => (item.progress?.tier ?? 0) <= 0,
    );

    return (
      <>
        <FeatsFilters
          category={value.category}
          query={value.query}
          status={value.status}
          total={items.length}
          onChange={setValue}
        />
        <FeatsSection
          kind={"obtained"}
          items={obtained}
          onOpenTiers={() => {}}
        />
        <FeatsSection
          kind={"notObtained"}
          items={notObtained}
          onOpenTiers={() => {}}
        />
      </>
    );
  }

  it("combines the category and status filters", () => {
    const model = buildFilterModel();
    renderWithProviders(<FiltersHarness items={model.items} />);

    expect(screen.getByText("Take Off")).toBeTruthy();
    expect(screen.getByText("Follower veteran")).toBeTruthy();
    expect(screen.getByText("Review rookie")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /Seguidores/ }));
    fireEvent.click(screen.getByRole("radio", { name: "Bloqueados" }));

    expect(screen.getByText("Take Off")).toBeTruthy();
    expect(screen.queryByText("Follower veteran")).toBeNull();
    expect(screen.queryByText("Review rookie")).toBeNull();
  });

  it("shows the counts of obtained feats and not obtained feats with secrets", () => {
    const model = buildFeatsModel({
      achievements: [
        ...Array.from({ length: 10 }, (_, index) =>
          feat(`obtained-${index}`, { name: `Obtido ${index}` }),
        ),
        ...Array.from({ length: 12 }, (_, index) =>
          feat(`locked-${index}`, { name: `Bloqueado ${index}` }),
        ),
        ...Array.from({ length: 2 }, (_, index) =>
          feat(`secret-${index}`, {
            name: null,
            description: null,
            icon: null,
            isHidden: true,
          }),
        ),
      ],
      progress: Array.from({ length: 10 }, (_, index) =>
        progress(`obtained-${index}`, { value: 10, tier: 1 }),
      ),
      now: NOW,
    });

    const obtained = model.items.filter(
      (item) => (item.progress?.tier ?? 0) > 0,
    );
    const notObtained = model.items.filter(
      (item) => (item.progress?.tier ?? 0) <= 0,
    );

    renderWithProviders(
      <>
        <FeatsSection
          kind={"obtained"}
          items={obtained}
          onOpenTiers={() => {}}
        />
        <FeatsSection
          kind={"notObtained"}
          items={notObtained}
          onOpenTiers={() => {}}
        />
      </>,
    );

    expect(screen.getByRole("heading", { name: "Obtidas" })).toBeTruthy();
    expect(screen.getByText("10 feitos")).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "Ainda não obtidas" }),
    ).toBeTruthy();
    expect(screen.getByText("14 feitos, 2 secretos")).toBeTruthy();
  });

  it("shows the empty state when the filters match nothing", () => {
    renderWithProviders(
      <FeatsSection
        kind={"notObtained"}
        items={[]}
        onOpenTiers={() => {}}
        showEmptyState
      />,
    );

    expect(screen.getByText("Nenhum feito encontrado")).toBeTruthy();
    expect(
      screen.getByText("Ajuste a busca ou os filtros e tente novamente."),
    ).toBeTruthy();
  });
});
