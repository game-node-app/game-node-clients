import {
    ActivityStatistics,
    CommentStatistics,
    FindOneStatisticsDto,
    GameStatistics,
    ReviewStatistics,
    StatisticsService,
    StatisticsStatus,
} from "@/wrapper/server";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ExtendedUseQueryResult } from "@/util/types/ExtendedUseQueryResult";

export type StatisticsWithStatus<T = any> = (T extends any
    ? GameStatistics | ReviewStatistics | ActivityStatistics | CommentStatistics
    : T) &
    StatisticsStatus;

export function useItemStatistics<T = any>(
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
                            sourceId: sourceId as any,
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
