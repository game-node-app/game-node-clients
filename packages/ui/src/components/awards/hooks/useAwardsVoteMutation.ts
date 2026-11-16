import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError, AwardsService } from "@repo/wrapper/server";
import { createErrorNotification } from "#@/util";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import type {
  AwardsBallot,
  AwardsVoteVariables,
} from "#@/components/awards/types";
import { getAwardsBallotQueryKey } from "./awardsQueryKeys";

interface AwardsVoteMutationContext {
  previous?: AwardsBallot;
}

/**
 * `POST /v1/awards/vote` (session).
 *
 * Optimistic on the cached ballot (design §2): only `voteGameId` and
 * `categoriesVoted` change; `playedNomineesCount` is untouched because voting
 * does not change what the user played. The ballot is refetched on settle and
 * restored on error, with the shared error notification.
 */
export function useAwardsVoteMutation(eventId: number | undefined) {
  const userId = useUserId();
  const queryClient = useQueryClient();
  const queryKey = getAwardsBallotQueryKey(eventId, userId);

  return useMutation<
    void,
    ApiError,
    AwardsVoteVariables,
    AwardsVoteMutationContext
  >({
    mutationFn: async ({ categoryId, gameId }) => {
      await AwardsService.awardsVoteControllerRegisterVoteV1({
        categoryId,
        gameId,
      });
    },
    onMutate: async ({ categoryId, gameId }) => {
      if (!eventId || !userId) return {};

      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<AwardsBallot>(queryKey);

      if (previous) {
        const previousCategory = previous.categories.find(
          (category) => category.id === categoryId,
        );
        const isNewVote =
          previousCategory != null && previousCategory.voteGameId == null;

        queryClient.setQueryData<AwardsBallot>(queryKey, {
          ...previous,
          categoriesVoted: previous.categoriesVoted + (isNewVote ? 1 : 0),
          categories: previous.categories.map((category) =>
            category.id === categoryId
              ? { ...category, voteGameId: gameId }
              : category,
          ),
        });
      }

      return { previous };
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      createErrorNotification(error);
    },
    onSettled: () => {
      if (!eventId || !userId) return;
      void queryClient.invalidateQueries({ queryKey });
    },
  });
}
