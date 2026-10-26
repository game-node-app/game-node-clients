import { useQuery } from "@tanstack/react-query";
import {
  StatisticsRankingsRequestDto,
  StatisticsService,
} from "@repo/wrapper/server";
import { useUserId } from "#@/components/auth/hooks/useUserId";

export function useTrendingReviews(
  dto: Omit<StatisticsRankingsRequestDto, "sourceType" | "mode">,
) {
  const actor = useUserId();
  const request = {
    ...dto,
    sourceType: StatisticsRankingsRequestDto.sourceType.REVIEW,
    mode: StatisticsRankingsRequestDto.mode.POPULAR,
  };
  return useQuery({
    queryKey: [
      "statistics",
      "trending",
      "review",
      request,
      actor ?? "anonymous",
    ],
    queryFn: () =>
      StatisticsService.statisticsControllerFindRankingsV1(request),
  });
}
