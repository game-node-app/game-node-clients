import type { CreateAchievementCodeRequestDto } from '../models/CreateAchievementCodeRequestDto';
import type { CreateAchievementCodeResponseDto } from '../models/CreateAchievementCodeResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class AchievementsCodeService {
    /**
     * @param code
     * @returns any
     * @throws ApiError
     */
    static achievementsCodeControllerConsumeV1(code: string): CancelablePromise<any>;
    /**
     * @param requestBody
     * @returns CreateAchievementCodeResponseDto
     * @throws ApiError
     */
    static achievementsCodeControllerGenerateV1(requestBody: CreateAchievementCodeRequestDto): CancelablePromise<CreateAchievementCodeResponseDto>;
}
//# sourceMappingURL=AchievementsCodeService.d.ts.map