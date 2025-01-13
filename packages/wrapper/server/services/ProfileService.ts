/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FindAllProfileResponseItemDto } from '../models/FindAllProfileResponseItemDto';
import type { Profile } from '../models/Profile';
import type { UpdateProfileDto } from '../models/UpdateProfileDto';
import type { UpdateProfileImageDto } from '../models/UpdateProfileImageDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ProfileService {
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static profileControllerUpdateV1(
        requestBody: UpdateProfileDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/v1/profile',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Used to access own profile
     * @returns Profile
     * @throws ApiError
     */
    public static profileControllerFindOwnV1(): CancelablePromise<Profile> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/profile',
        });
    }
    /**
     * @param formData
     * @returns any
     * @throws ApiError
     */
    public static profileControllerUpdateImageV1(
        formData: UpdateProfileImageDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/profile/image',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * @param imageType
     * @param imageId
     * @returns any
     * @throws ApiError
     */
    public static profileControllerRemoveImageV1(
        imageType: string,
        imageId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/profile/image/{type}/{id}',
            path: {
                'imageType': imageType,
                'imageId': imageId,
            },
        });
    }
    /**
     * @returns FindAllProfileResponseItemDto
     * @throws ApiError
     */
    public static profileControllerFindAllV1(): CancelablePromise<Array<FindAllProfileResponseItemDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/profile/all',
        });
    }
    /**
     * Used to access other users' profiles
     * @param id
     * @returns Profile
     * @throws ApiError
     */
    public static profileControllerFindOneByIdV1(
        id: string,
    ): CancelablePromise<Profile> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/profile/{id}',
            path: {
                'id': id,
            },
        });
    }
}
