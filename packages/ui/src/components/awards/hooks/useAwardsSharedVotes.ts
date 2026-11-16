import { useQuery } from "@tanstack/react-query";
import { ApiError, AwardsService } from "@repo/wrapper/server";
import type { AwardsUserVoteDto } from "@repo/wrapper/server";
import { getAwardsSharedVotesQueryKey } from "./awardsQueryKeys";

/**
 * `GET /v1/awards/:eventId/votes/:userId` (public). Powers the shared ballot
 * link, which must work without a session.
 */
export function useAwardsSharedVotes(
  eventId: number | undefined,
  userId: string | undefined,
) {
  return useQuery<AwardsUserVoteDto[], ApiError>({
    queryKey: getAwardsSharedVotesQueryKey(eventId, userId),
    queryFn: async () => {
      return AwardsService.awardsBallotControllerGetVotesByUserIdV1(
        eventId!,
        userId!,
      );
    },
    enabled: !!eventId && !!userId,
  });
}
