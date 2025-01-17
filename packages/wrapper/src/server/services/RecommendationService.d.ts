import type { GetRecommendationsResponseDto } from '../models/GetRecommendationsResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class RecommendationService {
    /**
     * @param criteria Criteria to be used for deciding on what to recommend.
     * E.g. finished games, genre of played games, etc.
     * @param limit
     * @returns GetRecommendationsResponseDto
     * @throws ApiError
     */
    static recommendationControllerGetRecommendationsV1(criteria: 'finished' | 'genre' | 'theme', limit?: number): CancelablePromise<GetRecommendationsResponseDto>;
}
//# sourceMappingURL=RecommendationService.d.ts.map