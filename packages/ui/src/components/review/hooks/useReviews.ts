import { useQuery } from "@tanstack/react-query";
import { ReviewsService } from "@repo/wrapper/server";

export function useReviews(reviewsIds: string[] | undefined) {
  return useQuery({
    queryKey: ["review", "all", reviewsIds],
    queryFn: async () => {
      if (reviewsIds == undefined) return null;
      const all = await ReviewsService.reviewsControllerFindAllByIdV1({
        reviewsIds,
      });
      return all;
    },
  });
}
