import { useQuery } from "@tanstack/react-query";
import { ReviewsService } from "@repo/wrapper/server";

export function useReview(reviewId: string | undefined) {
    return useQuery({
        queryKey: ["review", reviewId],
        queryFn: () => {
            if (!reviewId) {
                return null;
            }
            return ReviewsService.reviewsControllerFindOneByIdV1(reviewId);
        },
        enabled: reviewId != undefined,
    });
}
