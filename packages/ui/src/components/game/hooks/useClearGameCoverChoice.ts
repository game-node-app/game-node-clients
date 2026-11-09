import { useUserId } from "#@/components/auth/hooks/useUserId";
import {
  GameCoverChoiceMutationOptions,
  isUnauthorizedError,
} from "#@/components/game/util/gameCoverSelection";
import { invalidateGameCoverQueries } from "#@/components/game/util/invalidateGameCoverQueries";
import { createErrorNotification } from "#@/util/createErrorNotification";
import { GameCoverService } from "@repo/wrapper/server";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Removes the stored choice, returning the game to its default cover. No
 * optimistic update: on failure the previous selection must stay marked.
 */
export function useClearGameCoverChoice(
  gameId: number | undefined,
  options?: GameCoverChoiceMutationOptions,
) {
  const queryClient = useQueryClient();
  const userId = useUserId();

  return useMutation({
    meta: { skipAuthError: true },
    mutationFn: () => GameCoverService.gameCoverControllerRemoveMineV1(gameId!),
    onSuccess: () => {
      if (gameId == undefined) {
        return;
      }
      queryClient.setQueryData(["game-cover", gameId, "mine", userId], {
        coverOptionId: null,
      });
      invalidateGameCoverQueries(queryClient, gameId);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        options?.onUnauthorized?.();
        return;
      }
      createErrorNotification(error);
    },
  });
}
