import { queryOptions, useQuery } from "@tanstack/react-query";
import { ReviewsService } from "@repo/wrapper/server";

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
  options?: { enabled?: boolean; refetchOnMount?: boolean },
) {
  return useQuery({
    ...reviewOptions(reviewId),
    ...options,
    enabled: (options?.enabled ?? true) && reviewId != undefined,
  });
}
