import type { FindAllPlaytimeResponseDto } from '../models/FindAllPlaytimeResponseDto';
import type { Object } from '../models/Object';
import type { UserCumulativePlaytimeDto } from '../models/UserCumulativePlaytimeDto';
import type { UserPlaytime } from '../models/UserPlaytime';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class PlaytimeService {
    /**
     * @param gameId
     * @param userId
     * @returns UserCumulativePlaytimeDto
     * @throws ApiError
     */
    static playtimeControllerFindAccumulatedForUserIdAndGameIdV1(gameId: number, userId: string): CancelablePromise<UserCumulativePlaytimeDto>;
    /**
     * @param gameId
     * @param userId
     * @returns UserPlaytime
     * @throws ApiError
     */
    static playtimeControllerFindAllByUserIdAndGameIdV1(gameId: number, userId: string): CancelablePromise<Array<UserPlaytime>>;
    /**
     * @param userId
     * @param offset
     * @param limit
     * @param orderBy
     * @returns FindAllPlaytimeResponseDto
     * @throws ApiError
     */
    static playtimeControllerFindAllByUserIdV1(userId: string, offset?: number, limit?: number, orderBy?: Object): CancelablePromise<FindAllPlaytimeResponseDto>;
}
//# sourceMappingURL=PlaytimeService.d.ts.map