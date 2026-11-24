import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { GuildAccessResponseDto } from "@repo/wrapper/server";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { isGuildEarlyAccessError } from "../util/guildErrors";
import { guildKeys } from "./guildKeys";

/**
 * Applies the spec's blocked-response recovery (guild-access): flips the cached
 * access decision to `hasAccess: false` and re-reads `/v1/guild/access` once.
 * A second blocked response for the same cache state is a no-op, so parallel
 * requests never cause a refetch loop.
 */
export function denyGuildAccess(
  queryClient: QueryClient,
  userId: string | undefined,
): void {
  const queryKey = guildKeys.access(userId);
  const current = queryClient.getQueryData<GuildAccessResponseDto>(queryKey);

  if (current?.hasAccess === false) return;

  queryClient.setQueryData<GuildAccessResponseDto>(queryKey, {
    mode: current?.mode ?? GuildAccessResponseDto.mode.SUPPORTERS,
    hasAccess: false,
  });

  void queryClient.invalidateQueries({ queryKey });
}

/**
 * Watches a player query's error and downgrades the access gate when the server
 * answers `403 guild_early_access_required`. Guild queries never show a generic
 * notification for that code.
 */
export function useGuildEarlyAccessGuard(error: unknown): void {
  const userId = useUserId();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isGuildEarlyAccessError(error)) return;

    denyGuildAccess(queryClient, userId);
  }, [error, queryClient, userId]);
}
