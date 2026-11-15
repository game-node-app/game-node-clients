// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { I18nProvider } from "@repo/locales";
import {
  AchievementIconDto,
  AchievementProgressDto,
  AchievementTierV2Dto,
  AchievementV2Dto,
} from "@repo/wrapper/server";
import { FeatCard } from "../../../../../packages/ui/src/components/achievement/feats/FeatCard";
import {
  buildFeatsModel,
  FeatItem,
} from "../../../../../packages/ui/src/components/achievement/util/feats";

const tier = (
  level: number,
  threshold: number,
  expReward: number,
  rarity: number,
): AchievementTierV2Dto => ({
  level,
  threshold,
  expReward,
  obtainedCount: 10,
  rarity,
});

const achievement = (
  overrides: Partial<AchievementV2Dto> = {},
): AchievementV2Dto => ({
  id: "backlog-dragon",
  category: AchievementV2Dto.category._0,
  criteria: null,
  isHidden: false,
  name: "Backlog Dragon",
  description: "Acumule jogos na sua biblioteca.",
  metric: "library_games",
  icon: { kind: AchievementIconDto.kind.GLYPH, name: "book" },
  event: null,
  startsAt: null,
  endsAt: null,
  tiers: [
    tier(1, 10, 10, 0.4),
    tier(2, 25, 25, 0.2),
    tier(3, 50, 50, 0.09),
    tier(4, 250, 100, 0.05),
    tier(5, 500, 200, 0.02),
    tier(6, 1000, 500, 0.01),
  ],
  ...overrides,
});

const progress = (
  overrides: Partial<AchievementProgressDto> = {},
): AchievementProgressDto => ({
  achievementId: "backlog-dragon",
  value: 0,
  tier: 0,
  nextThreshold: 10,
  obtainedTiers: [],
  ...overrides,
});

const buildItem = (
  feat: AchievementV2Dto,
  featProgress?: AchievementProgressDto,
): FeatItem =>
  buildFeatsModel({
    achievements: [feat],
    progress: featProgress ? [featProgress] : [],
    now: Date.parse("2026-06-01T00:00:00.000Z"),
  }).items[0]!;

const renderCard = (item: FeatItem) => {
  const onOpenTiers = vi.fn();
  const result = render(
    <I18nProvider language="pt-BR">
      <MantineProvider>
        <FeatCard item={item} onOpenTiers={onOpenTiers} />
      </MantineProvider>
    </I18nProvider>,
  );
  return { ...result, onOpenTiers };
};

beforeEach(() => {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  });
});

afterEach(cleanup);

describe("FeatCard", () => {
  it("shows a multi-tier feat in progress with segments and next tier XP", () => {
    const item = buildItem(
      achievement(),
      progress({
        value: 61,
        tier: 3,
        nextThreshold: 250,
        obtainedTiers: [
          { level: 1, obtainedAt: "2025-11-03T00:00:00.000Z" },
          { level: 2, obtainedAt: "2025-12-19T00:00:00.000Z" },
          { level: 3, obtainedAt: "2026-09-08T00:00:00.000Z" },
        ],
      }),
    );
    const { container, onOpenTiers } = renderCard(item);

    expect(screen.getByText("Backlog Dragon")).toBeTruthy();
    expect(screen.getByText("Nível 3")).toBeTruthy();
    const segments = container.querySelector("[data-feat-tiers]");
    expect(segments?.querySelectorAll("[data-state='obtained']")).toHaveLength(
      3,
    );
    expect(
      segments?.querySelectorAll("[data-state='in-progress']"),
    ).toHaveLength(1);
    expect(segments?.querySelectorAll("[data-state='locked']")).toHaveLength(2);
    expect(screen.getByText("61 / 250")).toBeTruthy();
    expect(screen.getByText(/Nível 4 de 6/)).toBeTruthy();
    expect(screen.getByText("Próximo nível: 100 XP")).toBeTruthy();
    expect(screen.getByText("9% dos usuários")).toBeTruthy();
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe(
      "24.4",
    );

    fireEvent.click(screen.getByRole("button", { name: "Níveis" }));
    expect(onOpenTiers).toHaveBeenCalledWith(item);
  });

  it("shows a single-tier feat not obtained without segments and with its reward", () => {
    const item = buildItem(
      achievement({
        id: "critics-corner",
        name: "Critic's Corner",
        description: "Escreva reviews.",
        category: AchievementV2Dto.category._2,
        tiers: [tier(1, 10, 50, 0.14)],
      }),
      progress({
        achievementId: "critics-corner",
        value: 8,
        tier: 0,
        nextThreshold: 10,
      }),
    );
    const { container } = renderCard(item);

    expect(screen.getByText("Reviews")).toBeTruthy();
    expect(container.querySelector("[data-feat-tiers]")).toBeNull();
    expect(screen.getByText("8 / 10")).toBeTruthy();
    expect(screen.queryByText(/Nível 1 de 1/)).toBeNull();
    expect(screen.getByText("Recompensa: 50 XP")).toBeTruthy();
    expect(screen.getByText("14% dos usuários")).toBeTruthy();
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe(
      "80",
    );
  });

  it("shows a locked multi-tier feat with one in-progress segment", () => {
    const item = buildItem(
      achievement({
        id: "hidden-gems",
        name: "Hidden Gems",
        tiers: [
          tier(1, 5, 10, 0.1),
          tier(2, 10, 20, 0.08),
          tier(3, 20, 30, 0.05),
          tier(4, 40, 40, 0.02),
        ],
      }),
      progress({
        achievementId: "hidden-gems",
        value: 4,
        tier: 0,
        nextThreshold: 5,
      }),
    );
    const { container } = renderCard(item);

    expect(screen.getByText("Coleção")).toBeTruthy();
    const segments = container.querySelector("[data-feat-tiers]");
    expect(segments?.querySelectorAll("[data-state='obtained']")).toHaveLength(
      0,
    );
    expect(
      segments?.querySelectorAll("[data-state='in-progress']"),
    ).toHaveLength(1);
    expect(segments?.querySelectorAll("[data-state='locked']")).toHaveLength(3);
    expect(screen.getByText("4 / 5")).toBeTruthy();
    expect(screen.getByText(/Nível 1 de 4/)).toBeTruthy();
    expect(screen.getByText("Próximo nível: 10 XP")).toBeTruthy();
  });

  it("shows a completed feat without segments or progress bar", () => {
    const item = buildItem(
      achievement({
        id: "test-lab",
        name: "Test Lab",
        category: AchievementV2Dto.category._4,
        tiers: [tier(1, 10, 100, 0.1)],
      }),
      progress({
        achievementId: "test-lab",
        value: 10,
        tier: 1,
        nextThreshold: null,
      }),
    );
    const { container } = renderCard(item);

    expect(screen.getByText("Completa")).toBeTruthy();
    expect(screen.getByText("Obtida")).toBeTruthy();
    expect(screen.getByText("+100 XP ganhos")).toBeTruthy();
    expect(container.querySelector("[data-feat-tiers]")).toBeNull();
    expect(screen.queryByRole("progressbar")).toBeNull();
    expect(screen.getByText("10% dos usuários")).toBeTruthy();
  });

  it("masks a secret feat without offering the tier details", () => {
    const item = buildItem(
      achievement({
        id: "secret-feat",
        isHidden: true,
        name: null,
        description: null,
        icon: null,
        tiers: [],
      }),
      progress({
        achievementId: "secret-feat",
        tier: 0,
        value: 0,
        nextThreshold: null,
      }),
    );
    const { container } = renderCard(item);

    expect(screen.getByText("Conquista secreta")).toBeTruthy();
    expect(screen.getByText("Secreta")).toBeTruthy();
    expect(
      screen.getByText("Continue jogando para descobrir esta conquista."),
    ).toBeTruthy();
    expect(
      screen.getByText("Nome e critério revelados ao obter."),
    ).toBeTruthy();
    expect(screen.queryByText("Níveis")).toBeNull();
    expect(screen.queryByText(/% dos usuários/)).toBeNull();
    expect(
      container.querySelector("[data-state='secret']")?.className,
    ).toContain("border-dashed");
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe(
      "0",
    );
  });
});
