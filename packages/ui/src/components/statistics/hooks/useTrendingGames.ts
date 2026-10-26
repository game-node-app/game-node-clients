import {
  StatisticsRankingsRequestDto,
  StatisticsService,
} from "@repo/wrapper/server";
import { useQuery } from "@tanstack/react-query";

export function useTrendingGames(
  dto: Omit<StatisticsRankingsRequestDto, "sourceType" | "mode">,
) {
  const request = {
    ...dto,
    sourceType: StatisticsRankingsRequestDto.sourceType.GAME,
    mode: StatisticsRankingsRequestDto.mode.POPULAR,
  };
  return useQuery({
    queryKey: ["statistics", "trending", "game", request],
    queryFn: () =>
      StatisticsService.statisticsControllerFindRankingsV1(request),
  });
}
