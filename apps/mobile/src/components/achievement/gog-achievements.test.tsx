// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  GameAchievementDto,
  GameAchievementGroupDto,
  GameAchievementService,
  GameAchievementWithObtainedInfo,
} from "@repo/wrapper/server";
import { UIProvider } from "@repo/ui";
import { useGameAchievementsV2 } from "../../../../../packages/ui/src/components/game/achievement/hooks/useGameAchievementsV2";
import { GameAchievementProgressOverview } from "../../../../../packages/ui/src/components/game/achievement/view/GameAchievementProgressOverview";
import { GameAchievementsListItem } from "../../../../../packages/ui/src/components/game/achievement/list/GameAchievementsListItem";
import { GameAchievementsList } from "../../../../../packages/ui/src/components/game/achievement/list/GameAchievementsList";
import { GameInfoAchievementOverview } from "../../../../../packages/ui/src/components/game/info/achievement/GameInfoAchievementOverview";
import { GameInfoAchievementsScreen } from "../../../../../packages/ui/src/components/game/info/achievement/GameInfoAchievementsScreen";
import { CollectionEntryAchievementTracker } from "../../../../../packages/ui/src/components/collection/collection-entry/detail/CollectionEntryAchievementTracker";
import { GameInfoShareAchievementProgress } from "../../../../../packages/ui/src/components/game/share/GameInfoShareAchievementProgress";
import { MobileGameAchievementListItem } from "./MobileGameAchievementListItem";

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({
    t: (key: string, args?: Record<string, unknown>) =>
      key === "game.achievement.totalCount"
        ? `${args?.totalObtained}/${args?.total}`
        : key,
  }),
}));
vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => "owner" }),
);
vi.mock(
  "../../../../../packages/ui/src/components/game/hooks/useGamesResource",
  () => ({
    useGamesResource: () => ({
      data: [{ id: 6, name: "PC", abbreviation: "PC" }],
    }),
  }),
);
vi.mock(
  "../../../../../packages/ui/src/components/general/hooks/useOnMobile",
  () => ({ useOnMobile: () => false }),
);

const achievement: GameAchievementDto = {
  source: GameAchievementDto.source._5,
  externalId: "opaque_id",
  externalGameId: 42,
  gameId: 7,
  platformIds: [6],
  name: "GOG achievement",
  description: "From the server",
  iconUrl: "https://example.test/icon.png",
};
const group: GameAchievementGroupDto = {
  source: GameAchievementGroupDto.source._5,
  sourceName: "GOG",
  sourceAbbreviatedName: "GOG",
  iconName: "gog",
  achievements: [achievement],
};
const catalogue = () =>
  GameAchievementService.gameAchievementV2ControllerFindAllByGameIdV2;
const obtained = () =>
  GameAchievementService.gameAchievementV2ControllerFindAllObtainedByUserIdAndGameIdV2;
const progress = {
  source: 5,
  externalId: "opaque_id",
  externalGameId: 42,
  gameId: 7,
  isObtained: true,
  obtainedAt: null,
};
function setup() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>
      <MantineProvider>
        <UIProvider
          presenters={{
            Link: ({ children, ...props }: React.ComponentProps<"a">) => (
              <a {...props}>{children}</a>
            ),
          }}
          hooks={{} as never}
        >
          {children}
        </UIProvider>
      </MantineProvider>
    </QueryClientProvider>
  );
  return { client, wrapper };
}
beforeEach(() => {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  });
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.spyOn(
    GameAchievementService,
    "gameAchievementV2ControllerFindAllByGameIdV2",
  ).mockResolvedValue([group]);
  vi.spyOn(
    GameAchievementService,
    "gameAchievementV2ControllerFindAllObtainedByUserIdAndGameIdV2",
  ).mockResolvedValue([progress]);
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("GOG achievement reads", () => {
  it.each(["owner", "other-user", undefined])(
    "retains %s identity and matches external IDs within source",
    async (userId) => {
      vi.mocked(obtained()).mockResolvedValue([{ ...progress, source: 1 }]);
      const { wrapper } = setup();
      const { result } = renderHook(() => useGameAchievementsV2(userId, 7), {
        wrapper,
      });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(catalogue()).toHaveBeenCalledWith(7);
      if (userId) expect(obtained()).toHaveBeenCalledWith(userId, 7);
      else expect(obtained()).not.toHaveBeenCalled();
      expect(result.current.data?.[0]).toMatchObject({
        sourceName: "GOG",
        iconName: "gog",
        achievements: [
          {
            externalId: "opaque_id",
            platformIds: [6],
            isObtained: false,
            obtainedAt: null,
          },
        ],
      });
    },
  );
  it("matches GOG progress and preserves successful empty obtained responses", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useGameAchievementsV2("owner", 7), {
      wrapper,
    });
    await waitFor(() =>
      expect(result.current.data?.[0].achievements[0].isObtained).toBe(true),
    );
    vi.mocked(obtained()).mockResolvedValue([]);
    await result.current.refetch();
    await waitFor(() =>
      expect(result.current.data?.[0].achievements[0].isObtained).toBe(false),
    );
    expect(result.current.isError).toBe(false);
  });
  it("keeps successful empty catalogues distinct from errors", async () => {
    vi.mocked(catalogue()).mockResolvedValue([]);
    const { wrapper } = setup();
    const { result } = renderHook(() => useGameAchievementsV2(undefined, 7), {
      wrapper,
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
  it.each([
    "provider error",
    "truncated snapshot",
    "catalogue account unavailable",
  ])("preserves %s as a retryable error", async (message) => {
    vi.mocked(catalogue()).mockRejectedValue(new Error(message));
    const { wrapper } = setup();
    const { result } = renderHook(() => useGameAchievementsV2("owner", 7), {
      wrapper,
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe(message);
    expect(result.current.data).toBeUndefined();
  });
  it("retains cached progress after a failed obtained refresh", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useGameAchievementsV2("owner", 7), {
      wrapper,
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    vi.mocked(obtained()).mockRejectedValue(new Error("progress unavailable"));
    await result.current.refetch();
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data?.[0].achievements[0].isObtained).toBe(true);
  });
});

it.each([1, 5])(
  "uses count progress for source %s and guards empty totals",
  async (source) => {
    vi.mocked(catalogue()).mockResolvedValue([
      { ...group, source, achievements: [{ ...achievement, source }] },
    ]);
    vi.mocked(obtained()).mockResolvedValue([{ ...progress, source }]);
    const { wrapper, client } = setup();
    render(
      <GameAchievementProgressOverview
        userId="owner"
        gameId={7}
        source={source}
      />,
      { wrapper },
    );
    expect(await screen.findByText("1/1")).toBeTruthy();
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe(
      "100",
    );
    vi.mocked(catalogue()).mockResolvedValue([
      { ...group, source, achievements: [] },
    ]);
    await client.refetchQueries();
    await screen.findByText("0/0");
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe(
      "0",
    );
    expect(screen.queryByAltText("Gamerscore icon")).toBeNull();
  },
);

it.each([36, 11])("retains source %s summary decorations", async (source) => {
  vi.mocked(catalogue()).mockResolvedValue([
    {
      ...group,
      source,
      achievements: [
        {
          ...achievement,
          source,
          psnDetails: { trophyType: "gold" } as never,
          xboxDetails: { gamerScore: 50 } as never,
        },
      ],
    },
  ]);
  vi.mocked(obtained()).mockResolvedValue([{ ...progress, source }]);
  const { wrapper } = setup();
  render(
    <GameAchievementProgressOverview
      userId="owner"
      gameId={7}
      source={source}
    />,
    { wrapper },
  );
  if (source === 11) expect(await screen.findByText("50 / 50")).toBeTruthy();
  else expect(await screen.findByText("1 / 1")).toBeTruthy();
});

it.each([GameAchievementsListItem, MobileGameAchievementListItem])(
  "preserves hidden empty text and absent dates",
  (Component) => {
    const { wrapper } = setup();
    const { container } = render(
      <Component
        achievement={
          {
            ...achievement,
            name: "",
            description: "",
            isObtained: true,
            obtainedAt: null,
          } as GameAchievementWithObtainedInfo
        }
      />,
      { wrapper },
    );
    fireEvent.click(container.querySelector("img")!);
    for (const text of container.querySelectorAll(".mantine-Text-root"))
      expect(text.textContent).toBe("");
    expect(
      screen.queryByText(
        /obtainedAt|Invalid Date|platinum|gamerscore|ownedBy/i,
      ),
    ).toBeNull();
  },
);

it("shows valid mobile obtained dates", async () => {
  const { wrapper } = setup();
  render(
    <MobileGameAchievementListItem
      achievement={
        {
          ...achievement,
          isObtained: true,
          obtainedAt: "2026-10-01T10:00:00Z",
        } as GameAchievementWithObtainedInfo
      }
    />,
    { wrapper },
  );
  fireEvent.click(screen.getByText("GOG achievement"));
  expect(await screen.findByText("game.achievement.obtainedAt")).toBeTruthy();
});

it("shows the GOG tab, icon and PC group", async () => {
  const { wrapper } = setup();
  render(<GameInfoAchievementsScreen gameId={7} />, { wrapper });
  expect(await screen.findByRole("tab", { name: /GOG/ })).toBeTruthy();
  expect(screen.getByAltText("GOG").getAttribute("src")).toContain("/gog.png");
  expect(await screen.findByText("GOG achievement")).toBeTruthy();
});

const views = [
  ["overview", () => <GameInfoAchievementOverview gameId={7} />],
  ["screen", () => <GameInfoAchievementsScreen gameId={7} />],
  [
    "tracker",
    () => <CollectionEntryAchievementTracker userId="other-user" gameId={7} />,
  ],
  ["list", () => <GameAchievementsList userId="owner" gameId={7} source={5} />],
  [
    "summary",
    () => (
      <GameAchievementProgressOverview userId="owner" gameId={7} source={5} />
    ),
  ],
  ["sharing", () => <GameInfoShareAchievementProgress gameId={7} />],
] as const;
it.each(views)(
  "%s shows initial failures and allows retry",
  async (_name, view) => {
    vi.mocked(obtained()).mockRejectedValue(new Error("progress unavailable"));
    const { wrapper } = setup();
    render(view(), { wrapper });
    expect(await screen.findByText("progress unavailable")).toBeTruthy();
    expect(
      screen.queryByText("collectionEntry.achievements.noObtained"),
    ).toBeNull();
    expect(screen.queryByText("1/1")).toBeNull();
    vi.mocked(obtained()).mockResolvedValue([progress]);
    fireEvent.click(screen.getByRole("button", { name: "actions.retry" }));
    await waitFor(() =>
      expect(screen.queryByText("progress unavailable")).toBeNull(),
    );
  },
);

it("shows cached list items with a stale notice and suppresses completion on refresh failure", async () => {
  const { wrapper, client } = setup();
  render(<GameAchievementsList userId="owner" gameId={7} source={5} />, {
    wrapper,
  });
  await screen.findByText("1/1");
  vi.mocked(obtained()).mockRejectedValue(new Error("refresh failed"));
  await client.refetchQueries();
  expect(
    await screen.findByText("game.achievement.previousProgress"),
  ).toBeTruthy();
  expect(screen.getByText("GOG achievement")).toBeTruthy();
  expect(screen.queryByText("1/1")).toBeNull();
});
