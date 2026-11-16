import { useQuery } from "@tanstack/react-query";
import { AwardsService } from "@repo/wrapper/server";

/** `eventId` is optional so callers can keep the read disabled by phase. */
export function useAwardEventCategories(eventId: number | undefined) {
  return useQuery({
    queryKey: ["awards", "event", eventId, "categories"],
    queryFn: () => {
      return AwardsService.awardsControllerGetCategoriesByEventIdV1(eventId!);
    },
    enabled: !!eventId,
  });
}
