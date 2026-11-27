import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GuildService, UpdateGuildCosmeticsDto } from "@repo/wrapper/server";
import { invalidateGuild } from "./guildKeys";
import { useGuildMutationErrorHandler } from "./useGuildMutationErrorHandler";

/**
 * Equips/unequips a Guild cosmetic: title, avatar frame, License theme, stamp
 * style, tavern decor (max 4, ordered) and the Trophy Showcase (max 3 badges).
 * Only the fields present in the payload are sent; `null` clears an equippable
 * and arrays replace the whole selection. Nothing is patched optimistically: on
 * `guild_cosmetic_not_owned`/`guild_cosmetic_limit_exceeded` the previous
 * selection stays and the inventory is re-read from the server (spec guild-hall).
 */
export function useUpdateGuildCosmetics() {
  const queryClient = useQueryClient();
  const handleError = useGuildMutationErrorHandler();

  return useMutation({
    mutationFn: (dto: UpdateGuildCosmeticsDto) =>
      GuildService.guildControllerUpdateCosmeticsV1(dto),
    onError: (error) => handleError(error),
    onSettled: () => {
      void invalidateGuild(queryClient);
    },
  });
}
