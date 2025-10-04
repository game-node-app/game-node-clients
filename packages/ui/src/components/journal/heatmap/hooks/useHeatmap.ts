import { useQuery } from "@tanstack/react-query";
import { JournalService } from "@repo/wrapper/server";

export function useHeatmap(userId: string) {
  return useQuery({
    queryKey: ["journal", "heatmap", userId],
    queryFn: async () => {
      return JournalService.journalControllerGetHeatmapV1(userId);
    },
  });
}
