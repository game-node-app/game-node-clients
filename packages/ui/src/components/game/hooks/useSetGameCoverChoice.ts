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
 * Stores the choice by option id (never the image id). No optimistic update:
 * on a rejected option the previous selection must stay marked.
 */
export function useSetGameCoverChoice(
  gameId: number | undefined,
  options?: GameCoverChoiceMutationOptions,
) {
  const queryClient = useQueryClient();
  const userId = useUserId();

  return useMutation({
    meta: { skipAuthError: true },
    mutationFn: (coverOptionId: number) =>
      GameCoverService.gameCoverControllerSetMineV1(gameId!, {
        coverOptionId,
      }),
    onSuccess: (choice) => {
      if (gameId == undefined) {
        return;
      }
      queryClient.setQueryData(["game-cover", gameId, "mine", userId], choice);
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
