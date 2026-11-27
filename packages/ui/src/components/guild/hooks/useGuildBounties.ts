import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@repo/locales";
import {
  ApiError,
  GuildBountiesResponseDto,
  GuildService,
} from "@repo/wrapper/server";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { ExtendedUseQueryResult } from "#@/util";
import { retryUnlessGuildEarlyAccess } from "../util/guildErrors";
import {
  GUILD_QUERY_STALE_TIME,
  guildKeys,
  type GuildBountyLocale,
} from "./guildKeys";
import { useGuildAccess } from "./useGuildAccess";
import { useGuildEarlyAccessGuard } from "./useGuildEarlyAccessGuard";

/**
 * Community Bounties with the server-side translations of the active language.
 * The locale is part of the cache key, so switching languages refetches.
 */
export function useGuildBounties(): ExtendedUseQueryResult<GuildBountiesResponseDto> {
  const userId = useUserId();
  const access = useGuildAccess();
  const queryClient = useQueryClient();
  const { i18n } = useTranslation();
  const language = i18n?.resolvedLanguage ?? i18n?.language;
  const locale: GuildBountyLocale = language?.startsWith("pt") ? "pt-BR" : "en";
  const queryKey = guildKeys.bounties(userId, locale);
  const hasAccess = access.data?.hasAccess === true;

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey });
  };

  const query = useQuery<GuildBountiesResponseDto, ApiError>({
    queryKey,
    queryFn: () => GuildService.guildControllerListBountiesV1(locale),
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
