import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GuildService } from "@repo/wrapper/server";
import { invalidateGuild } from "./guildKeys";
import { useGuildMutationErrorHandler } from "./useGuildMutationErrorHandler";

/**
 * Abandons an `active` contract; the quest returns to the open board while its
 * week/event window is still valid.
 */
export function useAbandonGuildContract() {
  const queryClient = useQueryClient();
  const handleError = useGuildMutationErrorHandler();

  return useMutation({
    mutationFn: (contractId: string) =>
      GuildService.guildControllerAbandonContractV1(contractId),
    onError: handleError,
    onSettled: () => {
      void invalidateGuild(queryClient);
    },
  });
}
