import type { ProfileMetricsOverviewDto } from '../models/ProfileMetricsOverviewDto';
import type { ProfileMetricsTypeDistributionResponseDto } from '../models/ProfileMetricsTypeDistributionResponseDto';
import type { ProfileMetricsYearDistributionResponseDto } from '../models/ProfileMetricsYearDistributionResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class ProfileMetricsService {
    /**
     * Retrieves basic stats for a user profile
     * @param userId
     * @returns ProfileMetricsOverviewDto
     * @throws ApiError
     */
    static profileMetricsControllerGetStatsOverviewV1(userId: string): CancelablePromise<ProfileMetricsOverviewDto>;
    /**
     * @param userId
     * @param by
     * @returns ProfileMetricsYearDistributionResponseDto
     * @throws ApiError
     */
    static profileMetricsControllerGetYearDistributionV1(userId: string, by: 'release_year' | 'finish_year' | 'playtime'): CancelablePromise<ProfileMetricsYearDistributionResponseDto>;
    /**
     * @param userId
     * @param by
     * @returns ProfileMetricsTypeDistributionResponseDto
     * @throws ApiError
     */
    static profileMetricsControllerGetTypeDistributionV1(userId: string, by: 'genre' | 'category' | 'mode' | 'theme' | 'platform'): CancelablePromise<ProfileMetricsTypeDistributionResponseDto>;
}
//# sourceMappingURL=ProfileMetricsService.d.ts.map