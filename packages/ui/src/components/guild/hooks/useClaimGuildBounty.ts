import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GuildService } from "@repo/wrapper/server";
import { invalidateGuild } from "./guildKeys";
import { useGuildMutationErrorHandler } from "./useGuildMutationErrorHandler";

export type ClaimGuildBountyInput = {
  bountyId: string;
};

/**
 * Claims every unlocked, unclaimed Community Bounty milestone for the current
 * contributor. The response lists the newly claimed milestones and chests.
 */
export function useClaimGuildBounty() {
  const queryClient = useQueryClient();
  const handleError = useGuildMutationErrorHandler();

  return useMutation({
    mutationFn: ({ bountyId }: ClaimGuildBountyInput) =>
      GuildService.guildControllerClaimBountyV1(bountyId),
    onError: (error) => handleError(error),
    onSettled: () => {
      void invalidateGuild(queryClient);
    },
  });
}
