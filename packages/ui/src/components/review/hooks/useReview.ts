import { queryOptions, useQuery } from "@tanstack/react-query";
import { Review, ReviewsService } from "@repo/wrapper/server";
import { createBatchLoader } from "#@/util/createBatchLoader";

/** Review cards mounted together share one `POST /reviews/all` request. */
const loadReview = createBatchLoader<string, Review, undefined>({
  fetchMany: (reviewsIds) =>
    ReviewsService.reviewsControllerFindAllByIdV1({ reviewsIds }),
  fetchOne: (id) => ReviewsService.reviewsControllerFindOneByIdV1(id),
  getId: (review) => review.id,
});

export const reviewOptions = (reviewId: string | undefined | null) =>
  queryOptions({
    queryKey: ["review", reviewId],
    queryFn: () => {
      if (!reviewId) {
        return null;
      }
      return loadReview(reviewId, undefined);
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
