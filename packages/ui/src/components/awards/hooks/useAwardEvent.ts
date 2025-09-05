import { useQuery } from "@tanstack/react-query";
import { AwardsService } from "@repo/wrapper/server";

export interface UseAwardEventProps {
  eventId?: number;
  eventYear?: number;
}

/**
 * Returns an event by ID or running year.
 */
export function useAwardEvent({ eventYear, eventId }: UseAwardEventProps) {
  return useQuery({
    queryKey: ["awards", "event", eventYear, eventId],
    queryFn: async () => {
      if (eventYear) {
        return AwardsService.awardsControllerGetEventsByYearV1(eventYear);
      }

      return AwardsService.awardsControllerGetEventByIdV1(eventId!);
    },
    enabled: !!eventYear || !!eventId,
  });
}
