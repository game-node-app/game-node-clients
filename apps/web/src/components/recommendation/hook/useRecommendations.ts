import { useQuery } from "@tanstack/react-query";
import { RecommendationService } from "@/wrapper/server";

export type RecommendationCriteria = "finished" | "genre" | "theme";

export function useRecommendations(
    criteria: RecommendationCriteria,
    limit = 10,
) {
    return useQuery({
        queryKey: ["recommendation", criteria, limit],
        queryFn: async () => {
            return RecommendationService.recommendationControllerGetRecommendationsV1(
                criteria,
                limit,
            );
        },
        staleTime: Infinity,
    });
}
