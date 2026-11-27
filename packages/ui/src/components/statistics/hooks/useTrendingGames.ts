import {
  StatisticsRankingsRequestDto,
  StatisticsService,
} from "@repo/wrapper/server";
import { queryOptions, useQuery } from "@tanstack/react-query";

type TrendingGamesDto = Omit<
  StatisticsRankingsRequestDto,
  "sourceType" | "mode"
>;

export function trendingGamesOptions(dto: TrendingGamesDto) {
  const request = {
    ...dto,
    sourceType: StatisticsRankingsRequestDto.sourceType.GAME,
    mode: StatisticsRankingsRequestDto.mode.POPULAR,
  };
  return queryOptions({
    queryKey: ["statistics", "trending", "game", request],
    queryFn: () =>
      StatisticsService.statisticsControllerFindRankingsV1(request),
  });
}

export function useTrendingGames(dto: TrendingGamesDto) {
  return useQuery(trendingGamesOptions(dto));
}
