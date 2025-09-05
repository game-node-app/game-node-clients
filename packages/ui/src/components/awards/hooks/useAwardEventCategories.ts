import { useQuery } from "@tanstack/react-query";
import { AwardsService } from "@repo/wrapper/server";

export function useAwardEventCategories(eventId: number) {
  return useQuery({
    queryKey: ["awards", "event", eventId, "categories"],
    queryFn: () => {
      return AwardsService.awardsControllerGetCategoriesByEventIdV1(eventId);
    },
    enabled: !!eventId,
  });
}
