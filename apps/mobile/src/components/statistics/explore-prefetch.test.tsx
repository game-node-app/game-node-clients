// @vitest-environment jsdom
import { GameRepositoryService, StatisticsService } from "@repo/wrapper/server";
import {
  hydrate,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import type { ComponentType } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { getServerSideProps } from "../../../../web/src/pages/explore/index";
import { gamesResourceOptions } from "../../../../../packages/ui/src/components/game/hooks/useGamesResource";
import { useGames } from "../../../../../packages/ui/src/components/game/hooks/useGames";
import { useGamesByPages } from "../../../../../packages/ui/src/components/game/hooks/useGamesByPages";
import { useInfiniteTrendingGames } from "../../../../../packages/ui/src/components/statistics/hooks/useInfiniteTrendingGames";
import { useTrendingGames } from "../../../../../packages/ui/src/components/statistics/hooks/useTrendingGames";
import { getExploreRankingDto } from "../../../../../packages/ui/src/components/explore/util/exploreValue";
import {
  getTrendingShelfRequest,
  TRENDING_SHELF_RELATIONS,
} from "../../../../../packages/ui/src/components/explore/util/trendingShelf";

vi.mock("../../../../web/src/components/general/OpenGraph", () => ({
  OpenGraph: () => null,
}));
// `useGames` reads the session to decide whether to personalize covers; this
// page is read signed out, so the hydrated default key is used as-is.
vi.mock("../../../../../packages/ui/src/components/auth/authClient", () => ({
  authClient: { useSession: () => ({ data: null, isPending: false }) },
}));
// the page only needs the prefetch helpers; the screen has its own tests
vi.mock("@repo/ui", async () => ({
  ...(await import(
    "../../../../../packages/ui/src/components/explore/util/exploreValue"
  )),
  ...(await import(
    "../../../../../packages/ui/src/components/explore/util/trendingShelf"
  )),
  ...(await import(
    "../../../../../packages/ui/src/components/game/hooks/useGamesResource"
  )),
  ...(await import(
    "../../../../../packages/ui/src/components/statistics/hooks/useInfiniteTrendingGames"
  )),
  ExploreView: () => null,
  useAppExperience: () => "default",
}));

let rankings: ReturnType<typeof vi.fn>;
let games: ReturnType<typeof vi.fn>;

beforeEach(() => {
  rankings = vi.fn((dto: { offset: number }) =>
    Promise.resolve({
      items: [2, 1].map((sourceId) => ({ sourceId })),
      pagination: {
        total: 2,
        limit: 48,
        offset: dto.offset,
        hasNextPage: false,
      },
    }),
  );
  games = vi.fn((dto: { gameIds: number[] }) =>
    Promise.resolve(dto.gameIds.map((id) => ({ id, name: String(id) }))),
  );
  vi.spyOn(
    StatisticsService,
    "statisticsControllerFindRankingsV1",
  ).mockImplementation(rankings as never);
  vi.spyOn(
    GameRepositoryService,
    "gameRepositoryControllerFindAllByIdsV1",
  ).mockImplementation(games as never);
  vi.spyOn(
    GameRepositoryService,
    "gameRepositoryControllerGetResourceV1",
  ).mockResolvedValue([{ id: 12, name: "RPG" }] as never);
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const prefetch = async (query: Record<string, string>) => {
  const result = await getServerSideProps({
    query,
  } as unknown as import("next").NextPageContext);
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  // what Next does to the props; it rejects `undefined`
  hydrate(client, JSON.parse(JSON.stringify(result.props.dehydratedState)));
  expect(
    client.getQueryData(gamesResourceOptions("genres").queryKey),
  ).toHaveLength(1);
  return client;
};

const renderWith = (client: QueryClient, Probe: ComponentType) =>
  render(
    <QueryClientProvider client={client}>
      <Probe />
    </QueryClientProvider>,
  );

it("hydrates the overall shelf under the keys the screen reads", async () => {
  const client = await prefetch({ period: "week" });
  renderWith(client, function Shelf() {
    const ranking = useTrendingGames(getTrendingShelfRequest("week" as never));
    const content = useGames({
      gameIds: ranking.data?.items.map((item) => item.sourceId as number),
      relations: TRENDING_SHELF_RELATIONS,
    });
    return <span>{content.data?.map((game) => game.name).join()}</span>;
  });
  await waitFor(() => expect(screen.getByText("2,1")).toBeTruthy());
  expect(rankings).toHaveBeenCalledTimes(1);
  expect(games).toHaveBeenCalledTimes(1);
});

it.each([
  [{ genres: "4,5", period: "week" }, { genres: [4, 5] }],
  [{ view: "ranking", period: "week" }, {}],
])("hydrates the ranking of %o", async (query, criteria) => {
  const client = await prefetch(query);
  renderWith(client, function Ranking() {
    const ranking = useInfiniteTrendingGames(
      getExploreRankingDto({ period: "week" as never, criteria }),
    );
    const content = useGamesByPages(
      ranking.data?.pages.map((page) =>
        page.items.map((item) => item.sourceId as number),
      ),
      { cover: true },
    );
    return <span>{content.data?.map((game) => game.name).join()}</span>;
  });
  await waitFor(() => expect(screen.getByText("2,1")).toBeTruthy());
  expect(rankings).toHaveBeenCalledTimes(1);
  expect(games).toHaveBeenCalledTimes(1);
});
