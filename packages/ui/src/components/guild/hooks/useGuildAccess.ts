import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ApiError,
  GuildAccessResponseDto,
  GuildService,
} from "@repo/wrapper/server";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { ExtendedUseQueryResult } from "#@/util";
import {
  GUILD_ACCESS_FOCUS_REFRESH_MS,
  GUILD_ACCESS_STALE_TIME,
  guildKeys,
} from "./guildKeys";

/**
 * Public, server-driven access decision (spec guild-access). The query runs for
 * guests too and is re-read when the screen regains focus after more than five
 * minutes hidden (design D1: 60 s stale time, focus refetch on).
 */
export function useGuildAccess(): ExtendedUseQueryResult<GuildAccessResponseDto> {
  const userId = useUserId();
  const queryClient = useQueryClient();
  const queryKey = guildKeys.access(userId);
  const hiddenAt = useRef<number | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        hiddenAt.current = Date.now();
        return;
      }

      const lastHiddenAt = hiddenAt.current;
      hiddenAt.current = null;

      if (
        lastHiddenAt !== null &&
        Date.now() - lastHiddenAt >= GUILD_ACCESS_FOCUS_REFRESH_MS
      ) {
        void queryClient.invalidateQueries({
          queryKey: guildKeys.access(userId),
        });
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [queryClient, userId]);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey });
  };

  return {
    queryKey,
    invalidate,
    ...useQuery<GuildAccessResponseDto, ApiError>({
      queryKey,
      queryFn: () => GuildService.guildControllerGetAccessV1(),
      staleTime: GUILD_ACCESS_STALE_TIME,
      refetchOnWindowFocus: true,
    }),
  };
}
