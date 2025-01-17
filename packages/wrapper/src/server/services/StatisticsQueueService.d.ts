import type { StatisticsActionDto } from '../models/StatisticsActionDto';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class StatisticsQueueService {
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    static statisticsQueueControllerAddLikeV1(requestBody: StatisticsActionDto): CancelablePromise<any>;
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    static statisticsQueueControllerRemoveLikeV1(requestBody: StatisticsActionDto): CancelablePromise<any>;
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    static statisticsQueueControllerAddViewV1(requestBody: StatisticsActionDto): CancelablePromise<any>;
}
//# sourceMappingURL=StatisticsQueueService.d.ts.map