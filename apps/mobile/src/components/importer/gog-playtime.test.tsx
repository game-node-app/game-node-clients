// @vitest-environment jsdom
import React from "react";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { PlaytimeService, UserPlaytime } from "@repo/wrapper/server";
import { usePlaytimeForGame } from "../../../../../packages/ui/src/components/playtime/hooks/usePlaytimeForGame";
import { UserPlaytimeItem } from "../../../../../packages/ui/src/components/playtime/UserPlaytimeItem";
vi.mock(
  "../../../../../packages/ui/src/components/general/hooks/useOnMobile",
  () => ({ useOnMobile: () => false }),
);
vi.mock("../../../../../packages/ui/src/components/game/hooks/useGame", () => ({
  useGame: () => ({ data: undefined }),
}));
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
it("preserves GOG cumulative playtime without inventing dates or counts", async () => {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  });
  const fixture = {
    id: 1,
    gameId: 7,
    source: UserPlaytime.source.GOG,
    platformId: 6,
    platform: { name: "PC" },
    totalPlaytimeSeconds: 7200,
    recentPlaytimeSeconds: 0,
    firstPlayedDate: null,
    lastPlayedDate: null,
  } as UserPlaytime;
  vi.spyOn(
    PlaytimeService,
    "playtimeControllerFindAllByUserIdAndGameIdV1",
  ).mockResolvedValue([fixture]);
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: React.PropsWithChildren) => (
    <QueryClientProvider client={client}>
      <MantineProvider>{children}</MantineProvider>
    </QueryClientProvider>
  );
  const { result } = renderHook(() => usePlaytimeForGame("user", 7), {
    wrapper,
  });
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data?.[0]).toEqual(fixture);
  expect(result.current.data?.[0]).not.toHaveProperty("totalPlayCount");
  render(
    <UserPlaytimeItem playtime={result.current.data![0]} variant="compact" />,
    { wrapper },
  );
  expect(screen.getByText("2h")).toBeTruthy();
  expect(screen.getByRole("img").getAttribute("src")).toContain("/gog.png");
  expect(screen.queryByText(/Invalid Date|1970|session/i)).toBeNull();
});
