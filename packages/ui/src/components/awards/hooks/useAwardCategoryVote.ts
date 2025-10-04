import { useQuery } from "@tanstack/react-query";
import { AwardsService } from "@repo/wrapper/server";

export function useAwardCategoryVote(userId: string, categoryId: number) {
  return useQuery({
    queryKey: ["awards", "vote", userId, categoryId],
    queryFn: async () => {
      return AwardsService.awardsVoteControllerGetVoteByUserIdV1(
        userId,
        categoryId,
      );
    },
    retry: 1,
  });
}
