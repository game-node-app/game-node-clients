// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { Activity } from "@repo/wrapper/server";
import { ActivityItem } from "../../../../../packages/ui/src/components/activity/item/ActivityItem";
import enTranslations from "../../../../../packages/locales/src/translations/json/en.json";

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, any>) => {
      let val: any = enTranslations;
      for (const p of key.split(".")) val = val?.[p];
      return typeof val === "string"
        ? val.replace(/\{\{(\w+)\}\}/g, (_, k) => options?.[k] ?? "")
        : key;
    },
  }),
}));

vi.mock("../../../../../packages/ui/src/util", () => ({
  Link: ({ children }: any) => <a>{children}</a>,
}));

vi.mock("../../../../../packages/ui/src/components", () => {
  const empty = () => ({ data: undefined });
  return {
    AchievementBadge: ({ tier }: any) => <div data-testid="badge">{tier}</div>,
    ActivityItemLikes: () => <div>likes</div>,
    ActivityItemComments: () => <div>comments</div>,
    GameRating: () => null,
    ObtainedAchievementActivityContent: () => null,
    UserAvatar: () => null,
    useAchievementsV2: () => ({
      data: [{ id: "horror-critic", name: "Horror critic", icon: null }],
    }),
    useCollection: empty,
    useCollectionEntry: empty,
    useGame: empty,
    useObtainedGameAchievementActivity: empty,
    usePost: empty,
    useReview: empty,
    useUserProfile: () => ({ data: { username: "ana" } }),
  };
});

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

describe("ACHIEVEMENT_UNLOCKED activity", () => {
  it("shows the unlock text with the tier badge and keeps like and comment controls", () => {
    render(
      <MantineProvider>
        <ActivityItem
          activity={
            {
              id: "a1",
              type: Activity.type.ACHIEVEMENT_UNLOCKED,
              profileUserId: "u1",
              obtainedAchievementId: 5,
              obtainedAchievement: { achievementId: "horror-critic", tier: 2 },
            } as any
          }
        />
      </MantineProvider>,
    );
    expect(screen.getByText("Unlocked Horror critic tier 2")).toBeTruthy();
    expect(screen.getByTestId("badge").textContent).toBe("2");
    expect(screen.getByText("likes")).toBeTruthy();
    expect(screen.getByText("comments")).toBeTruthy();
  });
});
