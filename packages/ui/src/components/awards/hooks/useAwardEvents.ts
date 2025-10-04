import { useQuery } from "@tanstack/react-query";
import { AwardsService } from "@repo/wrapper/server";

export function useAwardEvents() {
  return useQuery({
    queryKey: ["awards", "events"],
    queryFn: () => {
      return AwardsService.awardsControllerGetEventsV1();
    },
  });
}
