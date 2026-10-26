import {
  StatisticsService,
  StatisticsSourceRequestDto,
  StatisticsStatusDto,
  StatisticsSummaryDto,
} from "@repo/wrapper/server";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { ExtendedUseQueryResult } from "#@/util/types/ExtendedUseQueryResult";

export type StatisticsWithStatus = StatisticsSummaryDto & StatisticsStatusDto;

export function useItemStatistics(
  sourceId: string | number | undefined,
  sourceType: StatisticsSourceRequestDto.sourceType,
): ExtendedUseQueryResult<StatisticsWithStatus> {
  const queryClient = useQueryClient();
  const actor = useUserId();
  const gameId =
    typeof sourceId === "number" ||
    (typeof sourceId === "string" && /^\d+$/.test(sourceId))
      ? Number(sourceId)
      : NaN;
  const canonicalId =
    sourceType === StatisticsSourceRequestDto.sourceType.GAME
      ? Number.isSafeInteger(gameId) && gameId > 0
        ? gameId
        : undefined
      : typeof sourceId === "string" && sourceId
        ? sourceId
        : undefined;
  const queryKey = [
    "statistics",
    sourceType,
    canonicalId,
    actor ?? "anonymous",
  ];
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: queryKey.slice(0, 3) });
  };

  return {
    ...useQuery({
      queryKey,
      enabled: canonicalId !== undefined,
      queryFn: async () => {
        if (canonicalId === undefined)
          throw new Error("Invalid statistics source");
        const [summary, status] = await Promise.all([
          StatisticsService.statisticsControllerFindSummaryV1({
            sourceId: canonicalId,
            sourceType,
          }),
          StatisticsService.statisticsControllerGetStatusV1(
            sourceType,
            canonicalId,
          ),
        ]);
        return { ...summary, ...status };
      },
    }),
    invalidate,
    queryKey,
  };
}
