import type { FindOneStatisticsDto } from '../models/FindOneStatisticsDto';
import type { FindStatisticsTrendingActivitiesDto } from '../models/FindStatisticsTrendingActivitiesDto';
import type { FindStatisticsTrendingGamesDto } from '../models/FindStatisticsTrendingGamesDto';
import type { FindStatisticsTrendingReviewsDto } from '../models/FindStatisticsTrendingReviewsDto';
import type { GameStatisticsPaginatedResponseDto } from '../models/GameStatisticsPaginatedResponseDto';
import type { ReviewStatisticsPaginatedResponseDto } from '../models/ReviewStatisticsPaginatedResponseDto';
import type { StatisticsStatus } from '../models/StatisticsStatus';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class StatisticsService {
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    static statisticsControllerFindOneBySourceIdAndTypeV1(requestBody: FindOneStatisticsDto): CancelablePromise<Record<string, any>>;
    /**
     * @param requestBody
     * @returns GameStatisticsPaginatedResponseDto
     * @throws ApiError
     */
    static statisticsControllerFindTrendingGamesV1(requestBody: FindStatisticsTrendingGamesDto): CancelablePromise<GameStatisticsPaginatedResponseDto>;
    /**
     * @param requestBody
     * @returns ReviewStatisticsPaginatedResponseDto
     * @throws ApiError
     */
    static statisticsControllerFindTrendingReviewsV1(requestBody: FindStatisticsTrendingReviewsDto): CancelablePromise<ReviewStatisticsPaginatedResponseDto>;
    /**
     * @param requestBody
     * @returns ReviewStatisticsPaginatedResponseDto
     * @throws ApiError
     */
    static statisticsControllerFindTrendingActivitiesV1(requestBody: FindStatisticsTrendingActivitiesDto): CancelablePromise<ReviewStatisticsPaginatedResponseDto>;
    /**
     * @param statisticsId
     * @param sourceType
     * @returns StatisticsStatus
     * @throws ApiError
     */
    static statisticsControllerGetStatusV1(statisticsId: number, sourceType: 'game' | 'review' | 'activity' | 'review_comment' | 'activity_comment'): CancelablePromise<StatisticsStatus>;
}
//# sourceMappingURL=StatisticsService.d.ts.map