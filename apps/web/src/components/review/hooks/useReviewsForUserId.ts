import { useQuery } from "@tanstack/react-query";
import { ReviewsService } from "@/wrapper/server";

export default function useReviewsForUserId(
    userId: string,
    offset?: number,
    limit?: number,
) {
    return useQuery({
        queryKey: ["reviews", "all", userId, offset, limit],
        queryFn: async () => {
            return await ReviewsService.reviewsControllerFindAllByUserIdV1(
                userId,
                offset,
                limit,
            );
        },
    });
}
