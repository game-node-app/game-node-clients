import type { FindAllProfileResponseItemDto } from '../models/FindAllProfileResponseItemDto';
import type { Profile } from '../models/Profile';
import type { UpdateProfileDto } from '../models/UpdateProfileDto';
import type { UpdateProfileImageDto } from '../models/UpdateProfileImageDto';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class ProfileService {
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    static profileControllerUpdateV1(requestBody: UpdateProfileDto): CancelablePromise<any>;
    /**
     * Used to access own profile
     * @returns Profile
     * @throws ApiError
     */
    static profileControllerFindOwnV1(): CancelablePromise<Profile>;
    /**
     * @param formData
     * @returns any
     * @throws ApiError
     */
    static profileControllerUpdateImageV1(formData: UpdateProfileImageDto): CancelablePromise<any>;
    /**
     * @param imageType
     * @param imageId
     * @returns any
     * @throws ApiError
     */
    static profileControllerRemoveImageV1(imageType: string, imageId: number): CancelablePromise<any>;
    /**
     * @returns FindAllProfileResponseItemDto
     * @throws ApiError
     */
    static profileControllerFindAllV1(): CancelablePromise<Array<FindAllProfileResponseItemDto>>;
    /**
     * Used to access other users' profiles
     * @param id
     * @returns Profile
     * @throws ApiError
     */
    static profileControllerFindOneByIdV1(id: string): CancelablePromise<Profile>;
}
//# sourceMappingURL=ProfileService.d.ts.map