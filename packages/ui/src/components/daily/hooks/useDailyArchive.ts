import { useQuery } from "@tanstack/react-query";
import { DailyService } from "@repo/wrapper/server";
import type { DailyMode } from "#@/components/daily/util/dailyModes";
import { useUserId } from "#@/components/auth/hooks/useUserId";

export function useDailyArchive(
  mode: DailyMode,
  offset: number,
  limit: number,
) {
  const userId = useUserId();
  return useQuery({
    queryKey: ["daily", "archive", mode, offset, limit, userId],
    queryFn: () =>
      DailyService.dailyControllerFindArchiveV1(mode, offset, limit),
  });
}
