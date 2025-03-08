import {
  FindOneStatisticsDto,
  GameStatistics,
  ReviewStatistics,
  StatisticsService,
  StatisticsStatus,
} from "@repo/wrapper/server";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ExtendedUseQueryResult } from "#@/util/types/ExtendedUseQueryResult";

export type StatisticsWithStatus<
  T extends GameStatistics | ReviewStatistics = GameStatistics,
> = T & StatisticsStatus;

export function useItemStatistics<
  T extends GameStatistics | ReviewStatistics = GameStatistics,
>(
  sourceId: string | number,
  sourceType: FindOneStatisticsDto.sourceType,
): ExtendedUseQueryResult<StatisticsWithStatus<T> | null> {
  const queryClient = useQueryClient();
  const queryKey = ["statistics", sourceType, sourceId];
  const invalidate = () => {
    queryClient
      .invalidateQueries({ queryKey: queryKey.slice(0, 2) })
      .then()
      .catch();
  };

  return {
    ...useQuery({
      queryKey,
      queryFn: async (): Promise<StatisticsWithStatus<T> | null> => {
        const statistics =
          await StatisticsService.statisticsControllerFindOneBySourceIdAndTypeV1(
            {
              sourceId: sourceId as string | number,
              sourceType: sourceType,
            },
          );
        if (statistics) {
          const statisticsStatus =
            await StatisticsService.statisticsControllerGetStatusV1(
              statistics.id,
              sourceType,
            );
          return {
            ...statistics,
            ...statisticsStatus,
          } as StatisticsWithStatus<T>;
        }

        return null;
      },
    }),
    invalidate,
    queryKey,
  };
}
