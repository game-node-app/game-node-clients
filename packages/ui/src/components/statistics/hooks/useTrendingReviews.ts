import { useQuery } from "@tanstack/react-query";
import {
  FindStatisticsTrendingReviewsDto,
  StatisticsService,
} from "@repo/wrapper/server";

export function useTrendingReviews(dto: FindStatisticsTrendingReviewsDto) {
  return useQuery({
    queryKey: ["statistics", "review", dto],
    queryFn: () => {
      return StatisticsService.statisticsControllerFindTrendingReviewsV1(dto);
    },
  });
}
