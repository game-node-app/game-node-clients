import { useQuery } from "@tanstack/react-query";
import { ReviewsService } from "@/wrapper/server";

export function useReviewsScore(gameId: number) {
    return useQuery({
        queryKey: ["review", "score", gameId],
        queryFn: () => {
            return ReviewsService.reviewsControllerGetScoreForGameIdV1(gameId);
        },
        staleTime: 5 * 1000,
    });
}
