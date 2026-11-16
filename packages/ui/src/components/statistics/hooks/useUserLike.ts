import {
  ReactionRequestDto,
  StatisticsService,
  StatisticsSourceRequestDto,
} from "@repo/wrapper/server";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  InitialItemStatistics,
  ItemStatisticsData,
  useItemStatistics,
} from "#@/components/statistics/hooks/useItemStatistics";
import { useUserId } from "#@/components/auth/hooks/useUserId";

export interface IToggleLikeProps {
  sourceId: string | number;
  sourceType: StatisticsSourceRequestDto.sourceType;
  initialStatistics?: InitialItemStatistics;
}

export function useUserLike({
  sourceId,
  sourceType,
  initialStatistics,
}: IToggleLikeProps) {
  const queryClient = useQueryClient();
  const userId = useUserId();
  const statisticsQuery = useItemStatistics(
    sourceId,
    sourceType,
    initialStatistics,
  );
  const queryKey = statisticsQuery.queryKey;
  const likeMutation = useMutation({
    mutationFn: async (variables: {
      wasLiked: boolean;
      key: unknown[];
      actor: string | undefined;
      sourceType: StatisticsSourceRequestDto.sourceType;
    }) => {
      if (!variables.actor) throw new Error("User is not logged in!");
      const canonicalId = variables.key[2];
      if (typeof canonicalId !== "string" && typeof canonicalId !== "number")
        throw new Error("Invalid statistics source");
      const dto: ReactionRequestDto = {
        sourceId: canonicalId,
        sourceType:
          variables.sourceType as unknown as ReactionRequestDto.sourceType,
      };
      return variables.wasLiked
        ? StatisticsService.statisticsControllerRemoveLikeV1(dto)
        : StatisticsService.statisticsControllerAddLikeV1(dto);
    },
    onMutate: async ({ key, wasLiked }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previousStatistics =
        queryClient.getQueryData<ItemStatisticsData>(key);
      if (previousStatistics)
        queryClient.setQueryData<ItemStatisticsData>(key, {
          ...previousStatistics,
          isLiked: !wasLiked,
          likesCount: wasLiked
            ? Math.max(0, previousStatistics.likesCount - 1)
            : previousStatistics.likesCount + 1,
        });
      return { previousStatistics };
    },
    onSuccess: (response, { key }) => {
      queryClient.setQueryData<ItemStatisticsData>(
        key,
        (previous) =>
          previous && {
            ...previous,
            isLiked: response.isLiked,
            likesCount: response.likesCount,
          },
      );
    },
    onError: (error, { key }, context) => {
      console.error(error);
      if (context?.previousStatistics)
        queryClient.setQueryData(key, context.previousStatistics);
    },
    onSettled: (_data, _error, { key }) => {
      void queryClient.invalidateQueries({ queryKey: key });
    },
  });
  const sameSource = likeMutation.variables?.key.every(
    (value, index) => value === queryKey[index],
  );
  const pending = sameSource && likeMutation.isPending;
  const committed =
    sameSource && likeMutation.isSuccess ? likeMutation.data : undefined;
  const isLiked =
    statisticsQuery.data?.isLiked ??
    (pending
      ? !likeMutation.variables!.wasLiked
      : (committed?.isLiked ?? false));
  const likesCount =
    statisticsQuery.data?.likesCount ??
    (pending
      ? likeMutation.variables!.wasLiked
        ? 0
        : 1
      : (committed?.likesCount ?? 0));
  return [
    likesCount,
    isLiked,
    () =>
      likeMutation.mutate({
        wasLiked: isLiked,
        key: queryKey,
        actor: userId,
        sourceType,
      }),
  ] as const;
}
