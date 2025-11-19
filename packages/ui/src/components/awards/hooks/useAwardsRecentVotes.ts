import { useQuery } from "@tanstack/react-query";
import { AwardsService } from "@repo/wrapper/server";

export function useAwardsRecentVotes(eventId: number) {
  return useQuery({
    queryKey: ["awards", "votes", "recent", eventId],
    queryFn: async () => {
      return AwardsService.awardsVoteControllerGetRecentVotesByEventIdV1(
        eventId,
      );
    },
    enabled: !!eventId,
  });
}
