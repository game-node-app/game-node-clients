// @vitest-environment jsdom
import { MantineProvider } from "@mantine/core";
import { Activity } from "@repo/wrapper/server";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import enTranslations from "../../../../../packages/locales/src/translations/json/en.json";
import { ActivityItem } from "../../../../../packages/ui/src/components/activity/item/ActivityItem";

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

vi.mock("../../../../../packages/ui/src/util", () => ({
  Link: ({ children }: import("react").PropsWithChildren) => <a>{children}</a>,
}));

vi.mock("../../../../../packages/ui/src/components", () => {
  const empty = () => ({ data: undefined });
  return {
    AchievementBadge: ({ tier }: { tier?: number }) => (
      <div data-testid="badge">{tier}</div>
    ),
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
            } as unknown as Activity
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
