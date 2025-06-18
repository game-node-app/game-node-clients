import { useQuery } from "@tanstack/react-query";
import { ReviewsService } from "../../../../../wrapper/src/server";

export function useReview(reviewId: string | undefined | null) {
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
