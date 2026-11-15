// @vitest-environment jsdom
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AchievementsService, AchievementV2Dto } from "@repo/wrapper/server";
import { FeatTiersModal } from "../../../../../packages/ui/src/components/achievement/feats/FeatTiersModal";
import {
  buildFeatsModel,
  type FeatItem,
  type FeatProgress,
} from "../../../../../packages/ui/src/components/achievement/util/feats";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";
import type { ModalComponentProps } from "../../../../../packages/ui/src/util/modal";
import enTranslations from "../../../../../packages/locales/src/translations/json/en.json";

const mocks = vi.hoisted(() => ({ onMobile: false }));
vi.mock(
  "../../../../../packages/ui/src/components/general/hooks/useOnMobile",
  () => ({ useOnMobile: () => mocks.onMobile }),
);

const notifications = vi.hoisted(() => ({ show: vi.fn() }));
vi.mock("@mantine/notifications", () => ({ notifications }));

const translate = (key: string, options?: Record<string, unknown>) => {
  const lookup = (path: string) => {
    let value: unknown = enTranslations;
    for (const part of path.split(".")) {
      value =
        typeof value === "object" && value !== null
          ? (value as Record<string, unknown>)[part]
          : undefined;
    }
    return value;
  };

  let value = lookup(key);
  if (typeof value !== "string") {
    const count = Number(options?.count ?? 0);
    value = lookup(`${key}_${count === 1 ? "one" : "other"}`);
  }

  return typeof value === "string"
    ? value.replace(/\{\{(\w+)\}\}/g, (_, name) =>
        String(options?.[name] ?? ""),
      )
    : key;
};

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({
    t: translate,
    i18n: { language: "en", resolvedLanguage: "en" },
  }),
}));

function ModalPresenter({ opened, title, children }: ModalComponentProps) {
  return opened ? (
    <div>
      {title && <h2>{title}</h2>}
      {children}
    </div>
  ) : null;
}

const createClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderModal = (
  item: FeatItem | null,
  isOwner = true,
  onClose = vi.fn(),
) =>
  render(
    <MantineProvider>
      <QueryClientProvider client={createClient()}>
        <UIProvider
          presenters={{ Modal: ModalPresenter }}
          hooks={{
            useRouter: () => ({
              back: () => {},
              pathname: "/feats/user-1",
              push: async () => {},
              query: new URLSearchParams(),
            }),
          }}
        >
          <FeatTiersModal
            opened
            onClose={onClose}
            item={item}
            targetUserId={"user-1"}
            isOwner={isOwner}
          />
        </UIProvider>
      </QueryClientProvider>
    </MantineProvider>,
  );

const tier = (
  level: number,
  threshold: number,
  expReward: number,
  rarity = 0.1,
) => ({
  level,
  threshold,
  expReward,
  obtainedCount: 0,
  rarity,
});

const achievement: AchievementV2Dto = {
  id: "backlog-dragon",
  name: "Backlog Dragon",
  description: "Collect games in your library.",
  category: 0,
  criteria: null,
  isHidden: false,
  metric: "library_games",
  icon: null,
  event: null,
  startsAt: null,
  endsAt: null,
  tiers: [
    tier(1, 1, 10, 0.82),
    tier(2, 10, 25, 0.41),
    tier(3, 50, 50, 0.09),
    tier(4, 250, 100, 0.02),
    tier(5, 500, 200, 0.006),
    tier(6, 1000, 400, 0.001),
  ],
};

const progress = (overrides: Partial<FeatProgress> = {}): FeatProgress => ({
  achievementId: "backlog-dragon",
  value: 61,
  tier: 3,
  nextThreshold: 250,
  obtainedTiers: [
    { level: 1, obtainedAt: "2025-11-03T12:00:00" },
    { level: 2, obtainedAt: "2025-12-19T12:00:00" },
    { level: 3, obtainedAt: "2026-09-08T12:00:00" },
  ],
  ...overrides,
});

const buildItem = (overrides: Partial<FeatProgress> = {}): FeatItem =>
  buildFeatsModel({
    achievements: [achievement],
    progress: [progress(overrides)],
    now: Date.parse("2026-11-14T12:00:00Z"),
  }).items[0];

const row = (level: number) =>
  document.querySelector<HTMLElement>(`[data-level="${level}"]`)!;

beforeEach(() => {
  vi.clearAllMocks();
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  });
  mocks.onMobile = false;
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("FeatTiersModal", () => {
  it("shows the tier 3 of 6 header, progress to tier 4 and every row status", () => {
    renderModal(buildItem());

    expect(screen.getByText("Tier 3 of 6")).toBeTruthy();
    expect(screen.getByText("Towards tier 4")).toBeTruthy();
    expect(screen.getByText("61 / 250 games")).toBeTruthy();

    expect(row(1).dataset.state).toBe("obtained");
    expect(row(1).textContent).toContain("Obtained on 11/03/2025");
    expect(row(1).textContent).toContain("82%");

    expect(row(2).textContent).toContain("Obtained on 12/19/2025");
    expect(row(3).textContent).toContain("Obtained on 09/08/2026");

    expect(row(4).dataset.state).toBe("progress");
    expect(row(4).textContent).toContain("61 / 250");
    expect(row(4).textContent).toContain("2%");

    expect(row(5).dataset.state).toBe("locked");
    expect(row(5).textContent).toContain("Locked");
    expect(row(6).textContent).toContain("Locked");

    expect(
      screen.getByRole("button", { name: "Feature on profile" }),
    ).toBeTruthy();
  });

  it("falls back to Obtained without a date when obtainedTiers is missing", () => {
    renderModal(
      buildItem({
        tier: 2,
        obtainedTiers: undefined,
      }),
    );

    expect(row(1).textContent).toContain("Obtained");
    expect(row(1).textContent).not.toContain("Obtained on");
    expect(row(2).textContent).toContain("Obtained");
    expect(row(2).textContent).not.toContain("Obtained on");
  });

  it("replaces the progress line with the completion state and dates every row", () => {
    renderModal(
      buildItem({
        value: 1000,
        tier: 6,
        nextThreshold: null,
        obtainedTiers: [1, 2, 3, 4, 5, 6].map((level) => ({
          level,
          obtainedAt: "2026-01-02T12:00:00",
        })),
      }),
    );

    expect(screen.getByText("Complete")).toBeTruthy();
    expect(screen.queryByText("Towards tier 7")).toBeNull();
    expect(document.querySelector('[role="progressbar"]')).toBeNull();
    for (const level of [1, 2, 3, 4, 5, 6]) {
      expect(row(level).textContent).toContain("Obtained on 01/02/2026");
    }
  });

  it("does not offer the feature action for a feat the user has no tier of", () => {
    renderModal(
      buildItem({
        value: 0,
        tier: 0,
        nextThreshold: 1,
        obtainedTiers: [],
      }),
    );

    expect(screen.getByText("Collection")).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: "Feature on profile" }),
    ).toBeNull();
  });

  it("does not offer the feature action to a visitor", () => {
    renderModal(buildItem(), false);

    expect(
      screen.queryByRole("button", { name: "Feature on profile" }),
    ).toBeNull();
  });

  it("features the feat and closes on success", async () => {
    const serviceSpy = vi
      .spyOn(
        AchievementsService,
        "achievementsV2ControllerUpdateFeaturedObtainedAchievementsV2",
      )
      .mockResolvedValue({} as never);
    const onClose = vi.fn();
    renderModal(buildItem(), true, onClose);

    fireEvent.click(screen.getByRole("button", { name: "Feature on profile" }));

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(serviceSpy).toHaveBeenCalledWith({
      featuredAchievementIds: ["backlog-dragon"],
    });
  });

  it("uses the two-line list below sm", () => {
    mocks.onMobile = true;
    renderModal(buildItem());

    expect(document.querySelector("table")).toBeNull();
    expect(row(1).textContent).toContain("Tier 1 · 1 game");
    expect(row(1).textContent).toContain("Obtained on 11/03/2025");
    expect(row(4).textContent).toContain("Tier 4 · 250 games");
    expect(row(4).textContent).toContain("61 / 250");
  });
});
