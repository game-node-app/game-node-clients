// @vitest-environment jsdom
import React from "react";
import { afterEach, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  StatisticsRankingsRequestDto as Ranking,
  StatisticsService,
} from "@repo/wrapper/server";
import { useInfiniteTrendingGames } from "../../../../../packages/ui/src/components/statistics/hooks/useInfiniteTrendingGames";
import ExplorePage from "../../pages/explore";
const completed = vi.hoisted(() => vi.fn());
vi.mock("../../components/explore/ExploreGamesPageView", () => ({
  ExploreGamesPageView: () => null,
}));
vi.mock("../../components/general/AppPage.tsx", async () => {
  const React = await import("react");
  return {
    AppPage: ({ children }: any) => React.createElement("div", null, children),
  };
});
vi.mock("@ionic/react", async () => {
  const React = await import("react");
  return {
    IonRefresher: ({ children, onIonRefresh }: any) =>
      React.createElement(
        "button",
        { onClick: () => onIonRefresh({ detail: { complete: completed } }) },
        children,
        "Refresh",
      ),
    IonRefresherContent: () => null,
  };
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  completed.mockClear();
});

it("refreshes the active period from page one after loading more pages", async () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const api = vi
    .spyOn(StatisticsService, "statisticsControllerFindRankingsV1")
    .mockImplementation(((dto: Ranking) =>
      Promise.resolve({
        items: [],
        pagination: {
          offset: dto.offset,
          limit: 48,
          total: 100,
          hasNextPage: true,
        },
      })) as any);
  const hook = renderHook(
    ({ period }) => useInfiniteTrendingGames({ period, limit: 48 }),
    { initialProps: { period: Ranking.period.WEEK }, wrapper },
  );
  render(<ExplorePage />, { wrapper });
  await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));
  await act(async () => {
    await hook.result.current.fetchNextPage();
  });
  await waitFor(() => expect(hook.result.current.data?.pages).toHaveLength(2));
  fireEvent.click(screen.getByText("Refresh"));
  await waitFor(() => expect(completed).toHaveBeenCalledTimes(1));
  await waitFor(() => expect(hook.result.current.data?.pages).toHaveLength(1));
  expect(api).toHaveBeenLastCalledWith(
    expect.objectContaining({ offset: 0, period: "week" }),
  );
  hook.rerender({ period: Ranking.period.ALL });
  await waitFor(() =>
    expect(api).toHaveBeenLastCalledWith(
      expect.objectContaining({ offset: 0, period: "all" }),
    ),
  );
});
