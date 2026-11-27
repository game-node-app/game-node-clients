import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AdvanceGuildChainDto,
  GuildChainsResponseDto,
  GuildService,
} from "@repo/wrapper/server";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { guildKeys, invalidateGuild } from "./guildKeys";
import { useGuildMutationErrorHandler } from "./useGuildMutationErrorHandler";

export type AdvanceGuildChainInput = {
  chainKey: string;
  /** Only needed to fill a missing bound game; inherited games are reused. */
  targetGameId?: number;
};

/**
 * Starts the next stage of a Quest Chain after the previous contract was
 * claimed, or retries the current stage after an abandon/expiry.
 */
export function useAdvanceGuildChain() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  const handleError = useGuildMutationErrorHandler();

  return useMutation({
    mutationFn: ({ chainKey, targetGameId }: AdvanceGuildChainInput) => {
      const body: AdvanceGuildChainDto = {};

      if (targetGameId !== undefined) {
        body.targetGameId = targetGameId;
      }

      return GuildService.guildControllerAdvanceChainV1(chainKey, body);
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
