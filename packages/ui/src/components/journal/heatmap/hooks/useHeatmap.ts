import { useQuery } from "@tanstack/react-query";
import { JournalService } from "@repo/wrapper/server";
import { useUserId } from "#@/components/auth/hooks/useUserId";

export function useHeatmap(userId: string) {
  const viewerId = useUserId();

  return useQuery({
    queryKey: ["journal", "heatmap", userId, viewerId ?? null],
    queryFn: async () => {
      return JournalService.journalControllerGetHeatmapV1(userId);
    },
  });
}
