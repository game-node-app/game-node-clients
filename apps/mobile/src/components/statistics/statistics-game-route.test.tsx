// @vitest-environment jsdom
import {
  StatisticsService,
  StatisticsSourceRequestDto,
} from "@repo/wrapper/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, waitFor } from "@testing-library/react";
import { useEffect } from "react";
import { MemoryRouter, Switch } from "react-router";
import { expect, it, vi } from "vitest";
import { useUserView } from "../../../../../packages/ui/src/components/statistics/hooks/useUserView";

vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({
    useUserId: () => undefined,
  }),
);

vi.mock("@/pages/game", () => ({
  default: function MockGamePage({ gameId }: { gameId: number }) {
    const [, , incrementView] = useUserView(
      gameId,
      StatisticsSourceRequestDto.sourceType.GAME,
    );
    useEffect(() => {
      incrementView("123e4567-e89b-12d3-a456-426614174000");
    }, [incrementView]);
    return null;
  },
}));

it("rejects malformed mobile game routes before source reads or views", async () => {
  for (const page of [
    "profile/profile",
    "profile/stats",
    "profile/review_list",
    "feats",
    "auth",
    "importer/importer",
    "importer/source",
    "activity",
    "activity/detail",
    "posts.tsx",
    "blog",
    "blog/detail",
    "blog/archive.tsx",
    "collection_entry.tsx",
    "preferences.tsx",
    "search.tsx",
    "awards/vote.tsx",
    "awards/nominees.tsx",
    "library/library",
    "library/library_collections",
    "library/collection",
    "library/collection_reorder",
    "awards",
    "awards/result",
    "recap/recap_stats",
    "journal/journal_achievements",
    "journal/journal",
    "connection_callback",
    "mcp",
  ])
    vi.doMock(`@/pages/${page}`, () => ({ default: () => null }));
  const { getCommonRoutes } = await import(
    "../../pages/routes/getCommonRoutes"
  );
  const summary = vi
    .spyOn(StatisticsService, "statisticsControllerFindSummaryV1")
    .mockResolvedValue({
      viewsCount: 0,
    } as unknown as import("@repo/wrapper/server").StatisticsSummaryDto);
  const status = vi
    .spyOn(StatisticsService, "statisticsControllerGetStatusV1")
    .mockResolvedValue({
      isViewed: false,
    } as unknown as import("@repo/wrapper/server").StatisticsStatusDto);
  const view = vi
    .spyOn(StatisticsService, "statisticsControllerRecordViewV1")
    .mockResolvedValue({
      accepted: true,
      viewId: "123e4567-e89b-12d3-a456-426614174000",
    });
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const open = (id: string) =>
    render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={[`/explore/game/${id}`]}>
          <Switch>{getCommonRoutes("/explore")}</Switch>
        </MemoryRouter>
      </QueryClientProvider>,
    );
  try {
    for (const id of ["42abc", "42.5", "0", "-42", "9007199254740992"]) {
      open(id).unmount();
      expect(summary).not.toHaveBeenCalled();
      expect(status).not.toHaveBeenCalled();
      expect(view).not.toHaveBeenCalled();
    }
    open("0042");
    await waitFor(() => expect(view).toHaveBeenCalledTimes(1));
    expect(summary).toHaveBeenCalledWith({ sourceType: "game", sourceId: 42 });
    expect(status).toHaveBeenCalledWith("game", 42);
    expect(view).toHaveBeenCalledWith({
      sourceType: "game",
      sourceId: 42,
      viewId: "123e4567-e89b-12d3-a456-426614174000",
    });
  } finally {
    cleanup();
    client.clear();
    vi.restoreAllMocks();
  }
});
