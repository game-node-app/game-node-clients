import { useQuery } from "@tanstack/react-query";
import { ReviewsService } from "@repo/wrapper/server";

export function useReviewsScore(gameId: number | undefined) {
  return useQuery({
    queryKey: ["review", "score", gameId],
    queryFn: () => {
      return ReviewsService.reviewsControllerGetScoreForGameIdV1(gameId!);
    },
    enabled: !!gameId,
  });
}
