import { useCallback } from "react";
import { QueryClient, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "@repo/locales";
import { GuildOverviewResponseDto } from "@repo/wrapper/server";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { createErrorNotification } from "#@/util";
import {
  GUILD_ACTIVE_CONTRACT_LIMIT_REACHED,
  GUILD_CHAIN_RANK_REQUIRED,
  GUILD_DEFAULT_MAX_ACTIVE_CONTRACTS,
  GUILD_EMPORIUM_RANK_REQUIRED,
  GUILD_REFRESH_ERROR_CODES,
  GUILD_TRANSLATED_ERROR_CODES,
  getGuildErrorCode,
  isGuildEarlyAccessError,
} from "../util/guildErrors";
import { guildKeys, invalidateGuild } from "./guildKeys";
import { denyGuildAccess } from "./useGuildEarlyAccessGuard";

const TRANSLATED_ERROR_CODES = new Set(GUILD_TRANSLATED_ERROR_CODES);
const REFRESH_ERROR_CODES = new Set(GUILD_REFRESH_ERROR_CODES);

type Translate = (
  key: string,
  options?: Record<string, string | number>,
) => string;

export type GuildMutationErrorDetails = {
  /**
   * Rank the failed action required; interpolated as `{{rank}}` into
   * `guild_emporium_rank_required` / `guild_chain_rank_required`.
   */
  requiredRank?: string | null;
};

/** Cap shown by the limit copy; the cached overview is authoritative. */
function getMaxActiveContracts(
  queryClient: QueryClient,
  userId: string | undefined,
): number {
  const overview = queryClient.getQueryData<GuildOverviewResponseDto>(
    guildKeys.overview(userId),
  );

  return (
    overview?.license?.perks?.maxActiveContracts ??
    GUILD_DEFAULT_MAX_ACTIVE_CONTRACTS
  );
}

/**
 * Shared mutation error handler (design D2): the 403 gate flips access
 * silently, every known business code shows its translated `guild.errors.<code>`
 * message (with `{{max}}` for the active-contract cap and `{{rank}}` for rank
 * failures), codes whose client handling asks for a refresh invalidate the
 * Guild reads, and unknown errors keep the standard red notification.
 */
export function useGuildMutationErrorHandler(): (
  error: unknown,
  details?: GuildMutationErrorDetails,
) => void {
  const userId = useUserId();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useCallback(
    (error: unknown, details?: GuildMutationErrorDetails) => {
      if (isGuildEarlyAccessError(error)) {
        denyGuildAccess(queryClient, userId);
        return;
      }

      const code = getGuildErrorCode(error);
      if (code && TRANSLATED_ERROR_CODES.has(code)) {
        console.error(error);

        const interpolation: Record<string, string | number> = {};

        if (code === GUILD_ACTIVE_CONTRACT_LIMIT_REACHED) {
          interpolation.max = getMaxActiveContracts(queryClient, userId);
        }

        if (
          (code === GUILD_EMPORIUM_RANK_REQUIRED ||
            code === GUILD_CHAIN_RANK_REQUIRED) &&
          details?.requiredRank
        ) {
          interpolation.rank = details.requiredRank;
        }

        if (REFRESH_ERROR_CODES.has(code)) {
          void invalidateGuild(queryClient);
        }

        notifications.show({
          color: "red",
          message: (t as unknown as Translate)(
            `guild.errors.${code}`,
            interpolation,
          ),
        });
        return;
      }

      createErrorNotification(
        error instanceof Error ? error : new Error(String(error)),
      );
    },
    [queryClient, t, userId],
  );
}
