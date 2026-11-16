import { useQuery } from "@tanstack/react-query";
import { AwardsService } from "@repo/wrapper/server";
import type { AwardsEvent } from "#@/components/awards/types";
import { toAwardsEvent } from "#@/components/awards/types";
import { getAwardEventQueryKey } from "./awardsQueryKeys";

export interface UseAwardEventProps {
  eventId?: number;
  eventYear?: number;
}

/**
 * Returns an event by ID or running year, with the server-computed `phase`
 * narrowed for the screens.
 */
export function useAwardEvent({ eventYear, eventId }: UseAwardEventProps) {
  return useQuery<AwardsEvent>({
    queryKey: getAwardEventQueryKey({ eventId, eventYear }),
    queryFn: async () => {
      if (eventId) {
        return toAwardsEvent(
          await AwardsService.awardsControllerGetEventByIdV1(eventId),
        );
      }

      return toAwardsEvent(
        await AwardsService.awardsControllerGetEventsByYearV1(eventYear!),
      );
    },
    enabled: !!eventYear || !!eventId,
  });
}
