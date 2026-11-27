import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GuildService } from "@repo/wrapper/server";
import { invalidateGuild } from "./guildKeys";
import { useGuildMutationErrorHandler } from "./useGuildMutationErrorHandler";

export type ExtendGuildContractInput = {
  contractId: string;
};

/**
 * Adds 7 days to an active contract (Hourglass extension, once per contract).
 * The server picks the free monthly Hourglass before a consumable.
 */
export function useExtendGuildContract() {
  const queryClient = useQueryClient();
  const handleError = useGuildMutationErrorHandler();

  return useMutation({
    mutationFn: ({ contractId }: ExtendGuildContractInput) =>
      GuildService.guildControllerExtendContractV1(contractId),
    onError: (error) => handleError(error),
    onSettled: () => {
      void invalidateGuild(queryClient);
    },
  });
}
