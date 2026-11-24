import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ApiError,
  GuildOverviewResponseDto,
  GuildService,
} from "@repo/wrapper/server";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { ExtendedUseQueryResult } from "#@/util";
import { retryUnlessGuildEarlyAccess } from "../util/guildErrors";
import { GUILD_QUERY_STALE_TIME, guildKeys } from "./guildKeys";
import { useGuildAccess } from "./useGuildAccess";
import { useGuildEarlyAccessGuard } from "./useGuildEarlyAccessGuard";

/**
 * Guild Hall overview (License, active contracts, counts and Lina). Disabled
 * for guests and for signed-in users without access (spec guild-access).
 */
export function useGuildOverview(): ExtendedUseQueryResult<GuildOverviewResponseDto> {
  const userId = useUserId();
  const access = useGuildAccess();
  const queryClient = useQueryClient();
  const queryKey = guildKeys.overview(userId);
  const hasAccess = access.data?.hasAccess === true;

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey });
  };

  const query = useQuery<GuildOverviewResponseDto, ApiError>({
    queryKey,
    queryFn: () => GuildService.guildControllerGetOverviewV1(),
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
