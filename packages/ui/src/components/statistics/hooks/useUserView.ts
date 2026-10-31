import { useCallback, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  StatisticsService,
  StatisticsSourceRequestDto,
  StatisticsViewRequestDto,
} from "@repo/wrapper/server";
import { useItemStatistics } from "#@/components/statistics/hooks/useItemStatistics";

export function useUserView(
  sourceId: string | number | undefined,
  sourceType: StatisticsSourceRequestDto.sourceType,
) {
  const statisticsQuery = useItemStatistics(sourceId, sourceType);
  const queryClient = useQueryClient();
  const identities = useRef(new Map<string, StatisticsViewRequestDto>());
  const pending = useRef(new Set<string>());
  const accepted = useRef(new Set<string>());
  const mutation = useMutation({
    mutationFn: async (variables: StatisticsViewRequestDto) => {
      const response =
        await StatisticsService.statisticsControllerRecordViewV1(variables);
      if (!response.accepted || response.viewId !== variables.viewId)
        throw new Error("View was not accepted");
      return response;
    },
    onSuccess: (_, variables) => {
      accepted.current.add(variables.viewId);
      void queryClient.invalidateQueries({
        queryKey: ["statistics", variables.sourceType, variables.sourceId],
      });
    },
    onSettled: (_, __, variables) => {
      pending.current.delete(variables.viewId);
    },
  });
  const canonicalId = statisticsQuery.queryKey[2];
  const { mutate } = mutation;
  const incrementView = useCallback(
    (viewId: string) => {
      if (pending.current.has(viewId) || accepted.current.has(viewId)) return;
      let variables = identities.current.get(viewId);
      if (!variables) {
        if (typeof canonicalId !== "string" && typeof canonicalId !== "number")
          return;
        variables = {
          sourceType:
            sourceType as unknown as StatisticsViewRequestDto.sourceType,
          sourceId: canonicalId,
          viewId,
        };
        identities.current.set(viewId, variables);
      }
      pending.current.add(viewId);
      mutate(variables);
    },
    [canonicalId, sourceType, mutate],
  );
  return [
    statisticsQuery.data?.viewsCount ?? 0,
    statisticsQuery.data?.isViewed ?? false,
    incrementView,
  ] as const;
}
