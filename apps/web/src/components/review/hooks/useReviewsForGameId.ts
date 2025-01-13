import { ExtendedUseQueryResult } from "@/util/types/ExtendedUseQueryResult";
import { FindReviewPaginatedDto, ReviewsService } from "@/wrapper/server";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TBasePaginationRequest } from "@/util/types/pagination";

export default function useReviewsForGameId(
    gameId: number,
    dto?: TBasePaginationRequest,
): ExtendedUseQueryResult<FindReviewPaginatedDto> {
    const queryClient = useQueryClient();
    const queryKey = ["review", gameId, dto];
    const invalidate = () =>
        queryClient.invalidateQueries({ queryKey: queryKey.slice(0, 2) });

    return {
        ...useQuery({
            queryKey,
            queryFn: async () => {
                if (gameId == undefined) return null;

                try {
                    return await ReviewsService.reviewsControllerFindAllByGameIdV1(
                        gameId,
                        dto?.offset,
                        dto?.limit,
                    );
                } catch (e) {
                    return null;
                }
            },
        }),
        queryKey,
        invalidate,
    };
}
