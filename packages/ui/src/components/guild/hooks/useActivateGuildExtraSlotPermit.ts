import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GuildService } from "@repo/wrapper/server";
import { invalidateGuild } from "./guildKeys";
import { useGuildMutationErrorHandler } from "./useGuildMutationErrorHandler";

/**
 * Consumes one Extra Slot Permit for the current São Paulo week, raising the
 * active-contract cap until the next Monday rollover.
 */
export function useActivateGuildExtraSlotPermit() {
  const queryClient = useQueryClient();
  const handleError = useGuildMutationErrorHandler();

  return useMutation({
    mutationFn: () => GuildService.guildControllerActivateExtraSlotPermitV1(),
    onError: (error) => handleError(error),
    onSettled: () => {
      void invalidateGuild(queryClient);
    },
  });
}
