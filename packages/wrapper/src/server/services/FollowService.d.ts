import type { FollowInfoRequestDto } from '../models/FollowInfoRequestDto';
import type { FollowInfoResponseDto } from '../models/FollowInfoResponseDto';
import type { FollowRegisterDto } from '../models/FollowRegisterDto';
import type { FollowRemoveDto } from '../models/FollowRemoveDto';
import type { FollowStatusDto } from '../models/FollowStatusDto';
import type { UserFollow } from '../models/UserFollow';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class FollowService {
    /**
     * @param followerUserId
     * @param followedUserId
     * @returns FollowStatusDto
     * @throws ApiError
     */
    static followControllerGetFollowerStatusV1(followerUserId: string, followedUserId: string): CancelablePromise<FollowStatusDto>;
    /**
     * @param id
     * @returns UserFollow
     * @throws ApiError
     */
    static followControllerGetUserFollowByIdV1(id: number): CancelablePromise<UserFollow>;
    /**
     * @param requestBody
     * @returns FollowInfoResponseDto
     * @throws ApiError
     */
    static followControllerGetFollowInfoV1(requestBody: FollowInfoRequestDto): CancelablePromise<FollowInfoResponseDto>;
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    static followControllerRegisterFollowV1(requestBody: FollowRegisterDto): CancelablePromise<any>;
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    static followControllerRemoveFollowV1(requestBody: FollowRemoveDto): CancelablePromise<any>;
}
//# sourceMappingURL=FollowService.d.ts.map