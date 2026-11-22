import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ApiError,
  GuildBoardResponseDto,
  GuildService,
} from "@repo/wrapper/server";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { ExtendedUseQueryResult } from "#@/util";
import { retryUnlessGuildEarlyAccess } from "../util/guildErrors";
import { GUILD_QUERY_STALE_TIME, guildKeys } from "./guildKeys";
import { useGuildAccess } from "./useGuildAccess";
import { useGuildEarlyAccessGuard } from "./useGuildEarlyAccessGuard";

/**
 * Weekly quest board. `quick` maps to Lina's "Any quicker quest?" option
 * (`GET /v1/guild/board?quick=true`).
 */
export function useGuildBoard(
  quick = false,
): ExtendedUseQueryResult<GuildBoardResponseDto> {
  const userId = useUserId();
  const access = useGuildAccess();
  const queryClient = useQueryClient();
  const queryKey = guildKeys.board(userId, quick);
  const hasAccess = access.data?.hasAccess === true;

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey });
  };

  const query = useQuery<GuildBoardResponseDto, ApiError>({
    queryKey,
    queryFn: () =>
      GuildService.guildControllerGetBoardV1(quick ? true : undefined),
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
