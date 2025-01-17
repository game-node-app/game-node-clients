import type { ActivitiesPaginatedResponseDto } from '../models/ActivitiesPaginatedResponseDto';
import type { Activity } from '../models/Activity';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class ActivitiesService {
    /**
     * @param userId
     * @param offset
     * @param limit
     * @returns ActivitiesPaginatedResponseDto
     * @throws ApiError
     */
    static activitiesRepositoryControllerFindLatestV1(userId?: string, offset?: number, limit?: number): CancelablePromise<ActivitiesPaginatedResponseDto>;
    /**
     * @param id
     * @returns Activity
     * @throws ApiError
     */
    static activitiesRepositoryControllerFindOneByIdV1(id: string): CancelablePromise<Activity>;
}
//# sourceMappingURL=ActivitiesService.d.ts.map