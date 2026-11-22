import {
  InfiniteData,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  ApiError,
  GuildContractsListResponseDto,
  GuildService,
} from "@repo/wrapper/server";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { ExtendedUseInfiniteQueryResult } from "#@/util";
import { retryUnlessGuildEarlyAccess } from "../util/guildErrors";
import {
  GUILD_CONTRACTS_PAGE_SIZE,
  GUILD_QUERY_STALE_TIME,
  guildKeys,
  type GuildContractsTab,
} from "./guildKeys";
import { useGuildAccess } from "./useGuildAccess";
import { useGuildEarlyAccessGuard } from "./useGuildEarlyAccessGuard";

/**
 * Paginated contract list for the "Accepted" and "Completed" tabs.
 */
export function useGuildContracts(
  tab: GuildContractsTab,
): ExtendedUseInfiniteQueryResult<GuildContractsListResponseDto> {
  const userId = useUserId();
  const access = useGuildAccess();
  const queryClient = useQueryClient();
  const queryKey = guildKeys.contracts(userId, tab);
  const hasAccess = access.data?.hasAccess === true;

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey });
  };

  const query = useInfiniteQuery<
    GuildContractsListResponseDto,
    ApiError,
    InfiniteData<GuildContractsListResponseDto>,
    unknown[],
    number
  >({
    queryKey,
    queryFn: ({ pageParam }) =>
      GuildService.guildControllerListContractsV1(
        undefined,
        tab,
        pageParam,
        GUILD_CONTRACTS_PAGE_SIZE,
      ),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.pagination.hasNextPage
        ? allPages.length * GUILD_CONTRACTS_PAGE_SIZE
        : undefined,
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
