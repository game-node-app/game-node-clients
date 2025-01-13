import { useMutation } from "@tanstack/react-query";
import {
    FindOneStatisticsDto,
    StatisticsActionDto,
    StatisticsQueueService,
} from "@/wrapper/server";
import { useItemStatistics } from "@/components/statistics/hooks/useItemStatistics";
import { useRef } from "react";

export function useUserView(
    sourceId: string | number,
    sourceType: FindOneStatisticsDto.sourceType,
) {
    const statisticsQuery = useItemStatistics(sourceId, sourceType);
    const viewsCount = statisticsQuery.data?.viewsCount || 0;
    const isViewed = statisticsQuery.data?.isViewed || false;
    /**
     * Avoids duplicate requests between re-renders.
     */
    const lastRegisteredViewSourceId = useRef<string | undefined>(undefined);
    const viewMutation = useMutation({
        mutationFn: async () => {
            if (
                lastRegisteredViewSourceId.current &&
                lastRegisteredViewSourceId.current === sourceId
            ) {
                return;
            }
            await StatisticsQueueService.statisticsQueueControllerAddViewV1({
                sourceId: sourceId,
                sourceType: sourceType as StatisticsActionDto.sourceType,
            });

            lastRegisteredViewSourceId.current = `${sourceId}`;
        },
    });

    const incrementView = () => {
        viewMutation.mutate();
    };

    return [viewsCount, isViewed, incrementView] as const;
}
