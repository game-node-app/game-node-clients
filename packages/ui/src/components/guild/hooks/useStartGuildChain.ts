import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  GuildChainsResponseDto,
  GuildService,
  StartGuildChainDto,
} from "@repo/wrapper/server";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { guildKeys, invalidateGuild } from "./guildKeys";
import { useGuildMutationErrorHandler } from "./useGuildMutationErrorHandler";

export type StartGuildChainInput = {
  chainKey: string;
  /** Required only when the first stage uses a bound game (Pathfinder's Arc). */
  targetGameId?: number;
};

/**
 * Starts a Quest Chain's first stage. The body is `{}` when no game binding is
 * needed; the server inherits the game for every later stage.
 */
export function useStartGuildChain() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  const handleError = useGuildMutationErrorHandler();

  return useMutation({
    mutationFn: ({ chainKey, targetGameId }: StartGuildChainInput) => {
      const body: StartGuildChainDto = {};

      if (targetGameId !== undefined) {
        body.targetGameId = targetGameId;
      }

      return GuildService.guildControllerStartChainV1(chainKey, body);
    },
    onError: (error, variables) => {
      const chains = queryClient.getQueryData<GuildChainsResponseDto>(
        guildKeys.chains(userId),
      );
      const chain = chains?.chains.find(
        (candidate) => String(candidate.chainKey) === variables.chainKey,
      );

      handleError(error, { requiredRank: chain?.minRank ?? null });
    },
    onSettled: () => {
      void invalidateGuild(queryClient);
    },
  });
}
