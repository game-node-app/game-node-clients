import React from "react";
import { ExtendedUseQueryResult } from "#@/util/types/ExtendedUseQueryResult";
import { Review, ReviewsService } from "../../../../../wrapper/src/server";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const useReviewForUserIdAndGameId = (
  userId: string | undefined,
  gameId: number | undefined,
): ExtendedUseQueryResult<Review | null> => {
  const queryClient = useQueryClient();
  const queryKey = ["review", userId, gameId];
  const invalidate = () => queryClient.invalidateQueries({ queryKey });
  return {
    ...useQuery({
      queryKey,
      queryFn: async () => {
        if (!userId || userId === "" || !gameId) return null;
        try {
          const review =
            await ReviewsService.reviewsControllerFindOneByUserIdAndGameIdV1(
              userId,
              gameId,
            );
          // No idea why this happens.
          if (typeof review === "undefined" || typeof review === "string") {
            return null;
          }
          return review;
        } catch (e) {
          return null;
        }
      },
      retry: false,
      retryOnMount: false,
    }),
    invalidate,
    queryKey,
  };
};

export { useReviewForUserIdAndGameId };
