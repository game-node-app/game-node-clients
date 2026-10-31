// @vitest-environment jsdom
import { MantineProvider } from "@mantine/core";
import {
  NotificationAchievementTargetDto,
  NotificationInboxItemDto,
} from "@repo/wrapper/server";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import enTranslations from "../../../../../packages/locales/src/translations/json/en.json";
import { AggregatedNotification } from "../../../../../packages/ui/src/components/notifications/AggregatedNotification";

const mockRouter = vi.hoisted(() => ({
  push: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../../../../packages/ui/src/util/link", () => ({
  useRouter: () => mockRouter,
}));

vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({
    useUserId: () => "user-1",
  }),
);

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

beforeEach(() => {
  vi.clearAllMocks();
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  });
});

afterEach(cleanup);

describe("achievement.unlocked notification", () => {
  const item: NotificationInboxItemDto = {
    id: 20,
    type: "achievement.unlocked",
    actors: [],
    actorCount: 0,
    eventCount: 1,
    preview: { text: "Horror critic" } as unknown as
      | import("@repo/wrapper/server").NotificationTextPreviewDto
      | import("@repo/wrapper/server").NotificationImportPreviewDto
      | null,
    target: {
      type: NotificationAchievementTargetDto.type.ACHIEVEMENT,
      id: "horror-critic",
      tier: 2,
    },
    lastEventAt: "2026-10-25T12:00:00Z",
    version: 1,
    readVersion: 1,
  };

  it("shows the name and tier and opens the own achievements page", () => {
    render(
      <MantineProvider>
        <AggregatedNotification
          aggregatedNotification={item}
          backgroundColor="normal"
          onClick={vi.fn()}
        />
      </MantineProvider>,
    );

    const text = screen.getByText("Unlocked Horror critic (tier 2)");
    fireEvent.click(text);
    expect(mockRouter.push).toHaveBeenCalledWith("/feats/user-1");
  });
});
