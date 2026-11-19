import { queryOptions, useQuery } from "@tanstack/react-query";
import { ReviewsService } from "../../../../../wrapper/src/server";

export const reviewOptions = (reviewId: string | undefined | null) =>
  queryOptions({
    queryKey: ["review", reviewId],
    queryFn: () => {
      if (!reviewId) {
        return null;
      }
      return ReviewsService.reviewsControllerFindOneByIdV1(reviewId);
    },
    enabled: reviewId != undefined,
  });

export function useReview(
  reviewId: string | undefined | null,
  options?: { enabled?: boolean },
) {
  return useQuery({
    ...reviewOptions(reviewId),
    enabled: (options?.enabled ?? true) && reviewId != undefined,
  });
}
