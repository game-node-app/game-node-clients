import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GuildEmporiumResponseDto, GuildService } from "@repo/wrapper/server";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { guildKeys, invalidateGuild } from "./guildKeys";
import { useGuildMutationErrorHandler } from "./useGuildMutationErrorHandler";

export type PurchaseGuildEmporiumItemInput = {
  emporiumItemId: string;
};

/**
 * Buys one Emporium listing. The response carries the new balance, the
 * consumable balances and, for chest listings, the opened chest.
 */
export function usePurchaseGuildEmporiumItem() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  const handleError = useGuildMutationErrorHandler();

  return useMutation({
    mutationFn: ({ emporiumItemId }: PurchaseGuildEmporiumItemInput) =>
      GuildService.guildControllerPurchaseEmporiumItemV1({ emporiumItemId }),
    onError: (error, variables) => {
      const emporium = queryClient.getQueryData<GuildEmporiumResponseDto>(
        guildKeys.emporium(userId),
      );
      const listing = [
        ...(emporium?.permanentItems ?? []),
        ...(emporium?.rotatingItems ?? []),
      ].find((item) => item.id === variables.emporiumItemId);

      handleError(error, { requiredRank: listing?.minRank ?? null });
    },
    onSettled: () => {
      void invalidateGuild(queryClient);
    },
  });
}
