import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GuildService } from "@repo/wrapper/server";
import { invalidateGuild } from "./guildKeys";
import { useGuildMutationErrorHandler } from "./useGuildMutationErrorHandler";

export type ClaimGuildPassportMilestoneInput = {
  milestone: 2 | 4 | 6;
};

/**
 * Claims one Monthly Guild Passport milestone (chest, flat Seals and the
 * milestone-6 Hourglass are granted atomically by the server).
 */
export function useClaimGuildPassportMilestone() {
  const queryClient = useQueryClient();
  const handleError = useGuildMutationErrorHandler();

  return useMutation({
    mutationFn: ({ milestone }: ClaimGuildPassportMilestoneInput) =>
      GuildService.guildControllerClaimPassportMilestoneV1(String(milestone)),
    onError: (error) => handleError(error),
    onSettled: () => {
      void invalidateGuild(queryClient);
    },
  });
}
