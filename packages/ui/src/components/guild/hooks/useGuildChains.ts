import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ApiError,
  GuildChainsResponseDto,
  GuildService,
} from "@repo/wrapper/server";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { ExtendedUseQueryResult } from "#@/util";
import { retryUnlessGuildEarlyAccess } from "../util/guildErrors";
import { GUILD_QUERY_STALE_TIME, guildKeys } from "./guildKeys";
import { useGuildAccess } from "./useGuildAccess";
import { useGuildEarlyAccessGuard } from "./useGuildEarlyAccessGuard";

/**
 * Lina's Arcs: the three Quest Chains with their stage definitions, status and
 * bindings.
 */
export function useGuildChains(): ExtendedUseQueryResult<GuildChainsResponseDto> {
  const userId = useUserId();
  const access = useGuildAccess();
  const queryClient = useQueryClient();
  const queryKey = guildKeys.chains(userId);
  const hasAccess = access.data?.hasAccess === true;

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey });
  };

  const query = useQuery<GuildChainsResponseDto, ApiError>({
    queryKey,
    queryFn: () => GuildService.guildControllerListChainsV1(),
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
