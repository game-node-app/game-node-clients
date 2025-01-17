import type { AchievementGrantRequestDto } from '../models/AchievementGrantRequestDto';
import type { ObtainedAchievement } from '../models/ObtainedAchievement';
import type { PaginatedAchievementsResponseDto } from '../models/PaginatedAchievementsResponseDto';
import type { UpdateFeaturedObtainedAchievementDto } from '../models/UpdateFeaturedObtainedAchievementDto';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class AchievementsService {
    /**
     * @param offset
     * @param limit
     * @returns PaginatedAchievementsResponseDto
     * @throws ApiError
     */
    static achievementsControllerGetAchievementsV1(offset?: number, limit?: number): CancelablePromise<PaginatedAchievementsResponseDto>;
    /**
     * @param id
     * @param targetUserId
     * @returns ObtainedAchievement
     * @throws ApiError
     */
    static achievementsControllerGetObtainedAchievementV1(id: string, targetUserId: string): CancelablePromise<ObtainedAchievement>;
    /**
     * @param targetUserId
     * @returns ObtainedAchievement
     * @throws ApiError
     */
    static achievementsControllerGetAllObtainedAchievementsV1(targetUserId: string): CancelablePromise<Array<ObtainedAchievement>>;
    /**
     * @param userId
     * @returns any
     * @throws ApiError
     */
    static achievementsControllerGetFeaturedAchievementForUserIdV1(userId: string): CancelablePromise<Record<string, any>>;
    /**
     * @param id
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    static achievementsControllerUpdateFeaturedObtainedAchievementV1(id: string, requestBody: UpdateFeaturedObtainedAchievementDto): CancelablePromise<any>;
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    static achievementsControllerGrantAchievementsV1(requestBody: AchievementGrantRequestDto): CancelablePromise<any>;
}
//# sourceMappingURL=AchievementsService.d.ts.map