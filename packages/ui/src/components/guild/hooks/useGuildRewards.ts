import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ApiError,
  GuildRewardsResponseDto,
  GuildService,
} from "@repo/wrapper/server";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { ExtendedUseQueryResult } from "#@/util";
import { retryUnlessGuildEarlyAccess } from "../util/guildErrors";
import { GUILD_QUERY_STALE_TIME, guildKeys } from "./guildKeys";
import { useGuildAccess } from "./useGuildAccess";
import { useGuildEarlyAccessGuard } from "./useGuildEarlyAccessGuard";

/**
 * Unlocked Guild rewards and the currently equipped title/frame.
 */
export function useGuildRewards(): ExtendedUseQueryResult<GuildRewardsResponseDto> {
  const userId = useUserId();
  const access = useGuildAccess();
  const queryClient = useQueryClient();
  const queryKey = guildKeys.rewards(userId);
  const hasAccess = access.data?.hasAccess === true;

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey });
  };

  const query = useQuery<GuildRewardsResponseDto, ApiError>({
    queryKey,
    queryFn: () => GuildService.guildControllerGetRewardsV1(),
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
