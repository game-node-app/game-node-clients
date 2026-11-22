import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GuildService } from "@repo/wrapper/server";
import { invalidateGuild } from "./guildKeys";
import { useGuildMutationErrorHandler } from "./useGuildMutationErrorHandler";

/**
 * Turns in a `ready_to_claim` contract. The response carries the celebration
 * payload (`xpAwarded`, rank change, unlocks and chest result).
 */
export function useClaimGuildContract() {
  const queryClient = useQueryClient();
  const handleError = useGuildMutationErrorHandler();

  return useMutation({
    mutationFn: (contractId: string) =>
      GuildService.guildControllerClaimContractV1(contractId),
    onError: handleError,
    onSettled: () => {
      void invalidateGuild(queryClient);
    },
  });
}
