import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ApiError,
  GuildEmporiumResponseDto,
  GuildService,
} from "@repo/wrapper/server";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { ExtendedUseQueryResult } from "#@/util";
import { retryUnlessGuildEarlyAccess } from "../util/guildErrors";
import { GUILD_QUERY_STALE_TIME, guildKeys } from "./guildKeys";
import { useGuildAccess } from "./useGuildAccess";
import { useGuildEarlyAccessGuard } from "./useGuildEarlyAccessGuard";

/**
 * Lina's Emporium shelves: permanent listings, the monthly rotating showcase,
 * the Seals balance and the next rotation date.
 */
export function useGuildEmporium(): ExtendedUseQueryResult<GuildEmporiumResponseDto> {
  const userId = useUserId();
  const access = useGuildAccess();
  const queryClient = useQueryClient();
  const queryKey = guildKeys.emporium(userId);
  const hasAccess = access.data?.hasAccess === true;

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey });
  };

  const query = useQuery<GuildEmporiumResponseDto, ApiError>({
    queryKey,
    queryFn: () => GuildService.guildControllerGetEmporiumV1(),
    enabled: !!userId && hasAccess,
    staleTime: GUILD_QUERY_STALE_TIME,
    refetchOnMount: true,
    retry: retryUnlessGuildEarlyAccess,
  });

  useGuildEarlyAccessGuard(query.error);

  return {
    queryKey,
    invalidate,
    ...query,
  };
}
