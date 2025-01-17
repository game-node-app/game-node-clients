import type { UserLevel } from '../models/UserLevel';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class LevelService {
    /**
     * @param userId
     * @returns UserLevel
     * @throws ApiError
     */
    static levelControllerFindOneV1(userId: string): CancelablePromise<UserLevel>;
}
//# sourceMappingURL=LevelService.d.ts.map