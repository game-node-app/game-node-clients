// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import {
  AchievementIconDto,
  AchievementProgressDto,
  AchievementV2Dto,
} from "@repo/wrapper/server";
import { AchievementBadge } from "../../../../../packages/ui/src/components/achievement/AchievementBadge";
import { AchievementItem } from "../../../../../packages/ui/src/components/achievement/AchievementItem";
import enTranslations from "../../../../../packages/locales/src/translations/json/en.json";

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      let val: unknown = enTranslations;
      for (const p of key.split("."))
        val =
          typeof val === "object" && val !== null
            ? (val as Record<string, unknown>)[p]
            : undefined;
      return typeof val === "string"
        ? val.replace(/\{\{(\w+)\}\}/g, (_, k) => String(options?.[k] ?? ""))
        : key;
    },
  }),
}));

vi.mock("../../../../../packages/ui/src/components/game/hooks/useGame", () => ({
  useGame: () => ({
    data: {
      source: "MYSQL",
      cover: { url: "https://images.igdb.com/cover.jpg" },
    },
  }),
}));

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

const renderWithMantine = (ui: React.ReactElement) =>
  render(<MantineProvider>{ui}</MantineProvider>);

describe("AchievementBadge", () => {
  it("renders the server icon for an image descriptor", () => {
    renderWithMantine(
      <AchievementBadge
        icon={{ kind: AchievementIconDto.kind.IMAGE, name: "space-station" }}
        tier={1}
      />,
    );
    expect(screen.getByAltText("space-station").getAttribute("src")).toContain(
      "space-station.png",
    );
  });

  it("renders the game cover for a game_cover descriptor", () => {
    renderWithMantine(
      <AchievementBadge
        icon={{ kind: AchievementIconDto.kind.GAME_COVER, gameId: 1164 }}
        tier={3}
      />,
    );
    expect(document.querySelector("img")?.getAttribute("src")).toContain(
      "cover.jpg",
    );
  });

  it("falls back to a glyph for an unknown name and locks at tier 0", () => {
    const { container } = renderWithMantine(
      <AchievementBadge
        icon={{ kind: AchievementIconDto.kind.GLYPH, name: "does-not-exist" }}
        tier={0}
      />,
    );
    expect(container.querySelector("svg")).toBeTruthy();
    expect(container.querySelector("[data-tier='0']")).toBeTruthy();
  });

  it("masks a null icon with a lock", () => {
    const { container } = renderWithMantine(
      <AchievementBadge icon={null} tier={0} />,
    );
    expect(container.querySelector("svg.tabler-icon-lock")).toBeTruthy();
  });
});

describe("AchievementItem", () => {
  const achievement: AchievementV2Dto = {
    id: "reviewer",
    category: 0 as unknown as AchievementV2Dto.category,
    criteria: null,
    isHidden: false,
    name: "Reviewer",
    description: "Write reviews",
    metric: "reviews_written",
    icon: { kind: AchievementIconDto.kind.GLYPH, name: "star" },
    event: null,
    startsAt: null,
    endsAt: null,
    tiers: [10, 50, 100].map((threshold, i) => ({
      level: i + 1,
      threshold,
      expReward: 100 * (i + 1),
      obtainedCount: 1,
      rarity: 0.25,
    })),
  };
  const progress = (
    p: Partial<AchievementProgressDto>,
  ): AchievementProgressDto => ({
    achievementId: "reviewer",
    value: 0,
    tier: 0,
    nextThreshold: 10,
    ...p,
  });

  it("shows partial progress with next threshold and next tier XP", () => {
    renderWithMantine(
      <AchievementItem
        achievement={achievement}
        progress={progress({ value: 37, tier: 1, nextThreshold: 50 })}
      />,
    );
    expect(screen.getByText(/37 \/ 50/)).toBeTruthy();
    expect(screen.getByText(/Next tier: 200 XP/)).toBeTruthy();
  });

  it("shows 0 of the first threshold when never evaluated", () => {
    renderWithMantine(<AchievementItem achievement={achievement} />);
    expect(screen.getByText(/0 \/ 10/)).toBeTruthy();
  });

  it("shows complete without a progress bar", () => {
    renderWithMantine(
      <AchievementItem
        achievement={achievement}
        progress={progress({ value: 120, tier: 3, nextThreshold: null })}
      />,
    );
    expect(screen.getByText("Complete")).toBeTruthy();
    expect(screen.queryByRole("progressbar")).toBeNull();
  });

  it("shows the secret placeholder for a masked achievement", () => {
    renderWithMantine(
      <AchievementItem
        achievement={{
          ...achievement,
          isHidden: true,
          name: null,
          description: null,
          icon: null,
          tiers: [],
        }}
      />,
    );
    expect(screen.getByText("Secret achievement")).toBeTruthy();
  });
});
