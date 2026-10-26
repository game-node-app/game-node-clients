import {
  FindOneStatisticsDto,
  ReactionRequestDto,
  ReactionResponseDto,
  StatisticsService,
} from "@repo/wrapper/server";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  StatisticsWithStatus,
  useItemStatistics,
} from "#@/components/statistics/hooks/useItemStatistics";
import { useUserId } from "#@/components/auth/hooks/useUserId";

export interface IToggleLikeProps {
  sourceId: string | number;
  sourceType: FindOneStatisticsDto.sourceType;
}

/**
 * Gets information about the number of likes on an item, and performs optimistic
 * toggles for likes of the current logged-in user.
 */
export function useUserLike({ sourceId, sourceType }: IToggleLikeProps) {
  const queryClient = useQueryClient();
  const userId = useUserId();
  const statisticsQuery = useItemStatistics(sourceId, sourceType);
  const statisticsQueryKey = statisticsQuery.queryKey;
  const isLiked = statisticsQuery.data?.isLiked || false;
  const likesCount = statisticsQuery.data?.likesCount || 0;

  const likeMutation = useMutation({
    mutationFn: async (wasLiked: boolean = isLiked) => {
      if (!userId) {
        throw new Error("User is not logged in!");
      }
      const formattedSourceId =
        sourceType === FindOneStatisticsDto.sourceType.GAME
          ? Number(sourceId)
          : String(sourceId);

      const dto: ReactionRequestDto = {
        sourceId:
          formattedSourceId as unknown as ReactionRequestDto["sourceId"],
        sourceType: sourceType as unknown as ReactionRequestDto.sourceType,
      };

      if (wasLiked) {
        return await StatisticsService.statisticsControllerRemoveLikeV1(dto);
      }

      return await StatisticsService.statisticsControllerAddLikeV1(dto);
    },

    onMutate: async (wasLiked: boolean = isLiked) => {
      await queryClient.cancelQueries({
        queryKey: statisticsQueryKey,
      });

      const previousStatistics =
        queryClient.getQueryData<StatisticsWithStatus>(statisticsQueryKey);

      const fallback: StatisticsWithStatus = {
        isLiked: wasLiked,
        likesCount,
        viewsCount: 0,
      } as StatisticsWithStatus;

      const current = previousStatistics ? { ...previousStatistics } : fallback;
      const willBeLiked = !wasLiked;
      const nextLikesCount = willBeLiked
        ? current.likesCount + 1
        : Math.max(0, current.likesCount - 1);

      const newStatistics: StatisticsWithStatus = {
        ...current,
        isLiked: willBeLiked,
        likesCount: nextLikesCount,
      };

      queryClient.setQueryData(statisticsQueryKey, newStatistics);

      return {
        previousStatistics,
      };
    },

    onSuccess: (response: ReactionResponseDto) => {
      queryClient.setQueryData<StatisticsWithStatus>(
        statisticsQueryKey,
        (prev) => {
          if (!prev) {
            return {
              isLiked: response.isLiked,
              likesCount: response.likesCount,
              viewsCount: 0,
            } as StatisticsWithStatus;
          }
          return {
            ...prev,
            isLiked: response.isLiked,
            likesCount: response.likesCount,
          };
        },
      );
    },

    onError: (err, _, context) => {
      console.error(err);
      queryClient.setQueryData(statisticsQueryKey, context?.previousStatistics);
    },
  });

  const toggleLike = () => likeMutation.mutate(isLiked);

  return [likesCount, isLiked, toggleLike] as const;
}
