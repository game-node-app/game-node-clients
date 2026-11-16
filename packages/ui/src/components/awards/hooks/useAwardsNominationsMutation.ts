import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError, AwardsService } from "@repo/wrapper/server";
import { createErrorNotification } from "#@/util";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import type {
  AwardsMyNominations,
  AwardsNominationsVariables,
} from "#@/components/awards/types";
import { getAwardsNominationsQueryKey } from "./awardsQueryKeys";

interface AwardsNominationsMutationContext {
  previous?: AwardsMyNominations[];
}

/**
 * `PUT /v1/awards/:eventId/nominations/:categoryId` (session).
 *
 * The body replaces the whole category, so the optimistic update replaces that
 * row of `nominations/me` (and rolls it back on a 400, e.g. an ineligible game).
 */
export function useAwardsNominationsMutation(eventId: number | undefined) {
  const userId = useUserId();
  const queryClient = useQueryClient();
  const queryKey = getAwardsNominationsQueryKey(eventId, userId);

  return useMutation<
    void,
    ApiError,
    AwardsNominationsVariables,
    AwardsNominationsMutationContext
  >({
    mutationFn: async ({ categoryId, gameIds }) => {
      await AwardsService.awardsNominationControllerReplaceNominationsV1(
        eventId!,
        categoryId,
        { gameIds },
      );
    },
    onMutate: async ({ categoryId, gameIds }) => {
      if (!eventId || !userId) return {};

      await queryClient.cancelQueries({ queryKey });
      const previous =
        queryClient.getQueryData<AwardsMyNominations[]>(queryKey);

      if (previous) {
        const hasCategory = previous.some(
          (row) => row.categoryId === categoryId,
        );

        queryClient.setQueryData<AwardsMyNominations[]>(
          queryKey,
          hasCategory
            ? previous.map((row) =>
                row.categoryId === categoryId ? { ...row, gameIds } : row,
              )
            : [...previous, { categoryId, gameIds }],
        );
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
