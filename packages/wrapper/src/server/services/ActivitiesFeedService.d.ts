import type { ActivitiesFeedPaginatedResponseDto } from '../models/ActivitiesFeedPaginatedResponseDto';
import type { Object } from '../models/Object';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class ActivitiesFeedService {
    /**
     * @param criteria
     * @param offset
     * @param limit
     * @param orderBy
     * @returns ActivitiesFeedPaginatedResponseDto
     * @throws ApiError
     */
    static activitiesFeedControllerBuildActivitiesFeedV1(criteria: 'following' | 'all', offset?: number, limit?: number, orderBy?: Object): CancelablePromise<ActivitiesFeedPaginatedResponseDto>;
}
//# sourceMappingURL=ActivitiesFeedService.d.ts.map