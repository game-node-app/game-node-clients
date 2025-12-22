import { useQuery } from "@tanstack/react-query";
import { AwardsService } from "@repo/wrapper/server";

export function useAwardCategoryResults(eventId: number | undefined) {
  return useQuery({
    queryKey: ["award", "category", "results", eventId],
    queryFn: async () => {
      return AwardsService.awardsControllerGetResultsByEventIdV1(eventId!);
    },
    enabled: !!eventId,
  });
}
