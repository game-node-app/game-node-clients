import { useQuery } from "@tanstack/react-query";
import { AwardsService } from "@repo/wrapper/server";
import type { AwardsEvent } from "#@/components/awards/types";
import { toAwardsEvent } from "#@/components/awards/types";

export function useAwardEvents() {
  return useQuery<AwardsEvent[]>({
    queryKey: ["awards", "events"],
    queryFn: async () => {
      const events = await AwardsService.awardsControllerGetEventsV1();
      return events.map(toAwardsEvent);
    },
  });
}
