import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GuildService, UpdateGuildCosmeticsDto } from "@repo/wrapper/server";
import { invalidateGuild } from "./guildKeys";
import { useGuildMutationErrorHandler } from "./useGuildMutationErrorHandler";

/**
 * Equips/unequips a Guild title or avatar frame. Nothing is patched
 * optimistically: on `guild_cosmetic_not_owned` the previous selection stays
 * and the inventory is re-read from the server (spec guild-hall).
 */
export function useUpdateGuildCosmetics() {
  const queryClient = useQueryClient();
  const handleError = useGuildMutationErrorHandler();

  return useMutation({
    mutationFn: (dto: UpdateGuildCosmeticsDto) =>
      GuildService.guildControllerUpdateCosmeticsV1(dto),
    onError: handleError,
    onSettled: () => {
      void invalidateGuild(queryClient);
    },
  });
}
