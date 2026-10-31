// @vitest-environment jsdom
import {
  GameRepositoryService,
  StatisticsService,
  StatisticsRankingsRequestDto,
} from "@repo/wrapper/server";
import {
  hydrate,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { getInfiniteTrendingGamesKey } from "../../../../../packages/ui/src/components/statistics/hooks/useInfiniteTrendingGames";
import { exploreScreenUrlQueryToDto } from "../../../../web/src/components/explore/utils";
import ExplorePage, {
  getServerSideProps,
} from "../../../../web/src/pages/explore/index";

vi.mock("next/head", () => ({ default: () => null }));
vi.mock("@repo/locales", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@mantine/hooks", async () => ({
  ...(await vi.importActual<typeof import("@mantine/hooks")>("@mantine/hooks")),
  useWindowScroll: () => [{ y: 0 }, vi.fn()],
}));
vi.mock("@mantine/core", async () => {
  const React = await import("react");
  const actual =
    await vi.importActual<typeof import("@mantine/core")>("@mantine/core");
  const C = ({ children }: import("react").PropsWithChildren) =>
    React.createElement("div", null, children);
  return {
    ...actual,
    ActionIcon: C,
    Affix: C,
    Skeleton: C,
    Stack: C,
    Transition: () => null,
  };
});
vi.mock(
  "../../../../web/src/components/explore/ExploreScreenFilters",
  async () => {
    const React = await import("react");
    return {
      default: function MockExploreFilters({
        hasLoadedQueryParams,
        onFilterChange,
      }: import("react").ComponentProps<
        typeof import("../../../../web/src/components/explore/ExploreScreenFilters").default
      >) {
        React.useEffect(() => {
          if (!hasLoadedQueryParams)
            onFilterChange((dto) => ({
              ...dto,
              period: StatisticsRankingsRequestDto.period.WEEK,
              criteria: { genres: [4, 5] },
            }));
        }, [hasLoadedQueryParams, onFilterChange]);
        return null;
      },
    };
  },
);
vi.mock("@repo/ui", async () => {
  const React = await import("react");
  const infinite = await import(
    "../../../../../packages/ui/src/components/statistics/hooks/useInfiniteTrendingGames"
  );
  const games = await import(
    "../../../../../packages/ui/src/components/game/hooks/useGames"
  );
  const C = ({ children }: import("react").PropsWithChildren) =>
    React.createElement("div", null, children);
  C.Content = function MockContent({
    items,
    children,
  }: import("react").PropsWithChildren<{
    items?: import("@repo/wrapper/server").Game[];
  }>) {
    return React.createElement(
      "div",
      null,
      items?.map((game: import("@repo/wrapper/server").Game) =>
        React.createElement("span", { key: game.id }, game.name),
      ),
      children,
    );
  };
  C.LoadingSkeletons = function MockLoadingSkeletons() {
    return null;
  };
  return {
    ...infinite,
    ...games,
    GameView: C,
    CenteredErrorMessage: C,
    SimpleInfiniteLoader: ({
      fetchNextPage,
      hasNextPage,
    }: {
      fetchNextPage: () => void;
      hasNextPage: boolean;
    }) =>
      React.createElement(
        "button",
        { onClick: fetchNextPage, disabled: !hasNextPage },
        "More",
      ),
  };
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it("hydrates matching ranking and content keys and retains first-occurrence order across overlapping pages", async () => {
  const rankings = vi
    .spyOn(StatisticsService, "statisticsControllerFindRankingsV1")
    .mockImplementation(((
      dto: import("@repo/wrapper/server").StatisticsRankingsRequestDto,
    ) =>
      Promise.resolve({
        items: (dto.offset === 0 ? [2, 1] : [1, 3]).map((sourceId) => ({
          sourceId,
        })),
        pagination: {
          total: 3,
          limit: 20,
          offset: dto.offset,
          hasNextPage: dto.offset === 0,
        },
      })) as unknown as typeof StatisticsService.statisticsControllerFindRankingsV1);
  const content = vi
    .spyOn(GameRepositoryService, "gameRepositoryControllerFindAllByIdsV1")
    .mockImplementation(((
      dto: import("@repo/wrapper/server").GameRepositoryFindAllDto,
    ) =>
      Promise.resolve(
        [...dto.gameIds].reverse().map((id) => ({ id, name: String(id) })),
      )) as unknown as typeof GameRepositoryService.gameRepositoryControllerFindAllByIdsV1);
  const query = { period: "week", genres: "4,5" };
  const result = await getServerSideProps({
    query,
  } as unknown as import("next").NextPageContext);
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  hydrate(client, result.props.dehydratedState);
  expect(
    client.getQueryData(
      getInfiniteTrendingGamesKey(exploreScreenUrlQueryToDto(query)),
    ),
  ).toBeDefined();
  expect(
    client.getQueryData(["game", "all", [2, 1], { cover: true }]),
  ).toBeDefined();
  render(
    <QueryClientProvider client={client}>
      <ExplorePage />
    </QueryClientProvider>,
  );
  await waitFor(() => expect(screen.getByText("2")).toBeTruthy());
  expect(content).toHaveBeenCalledTimes(1);
  expect(rankings).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByText("More"));
  await waitFor(() =>
    expect(rankings).toHaveBeenLastCalledWith(
      expect.objectContaining({
        period: "week",
        criteria: { genres: [4, 5] },
        offset: 20,
      }),
    ),
  );
  await waitFor(() => expect(screen.getByText("3")).toBeTruthy());
  const values = ["2", "1", "3"].map((value) => screen.getByText(value));
  expect(
    values[0].compareDocumentPosition(values[1]) &
      Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
  expect(
    values[1].compareDocumentPosition(values[2]) &
      Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
  expect(screen.getAllByText("1")).toHaveLength(1);
});
