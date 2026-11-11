/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FindAllProfileResponseItemDto } from '../models/FindAllProfileResponseItemDto';
import type { ProfilePresenceResponseDto } from '../models/ProfilePresenceResponseDto';
import type { ProfileResponseDto } from '../models/ProfileResponseDto';
import type { SupporterPreferencesResponseDto } from '../models/SupporterPreferencesResponseDto';
import type { UpdateProfileDto } from '../models/UpdateProfileDto';
import type { UpdateProfileImageDto } from '../models/UpdateProfileImageDto';
import type { UpdateSupporterPreferencesDto } from '../models/UpdateSupporterPreferencesDto';
import type { UploadProfileVideoResponseDto } from '../models/UploadProfileVideoResponseDto';
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
     * @returns ProfileResponseDto
     * @throws ApiError
     */
    public static profileControllerFindOwnV1(): CancelablePromise<ProfileResponseDto> {
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
     * @returns ProfileResponseDto
     * @throws ApiError
     */
    public static profileControllerFindOneByIdV1(
        id: string,
    ): CancelablePromise<ProfileResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/profile/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * The body is parsed here instead of a pipe so every rejection after Multer
     * can remove the temporary source in the same catch.
     * @param formData
     * @returns UploadProfileVideoResponseDto
     * @throws ApiError
     */
    public static profileVideoControllerUploadV1(
        formData: {
            file: Blob;
            type: 'avatar' | 'banner';
            cropX?: number;
            cropY?: number;
            cropWidth?: number;
            cropHeight?: number;
        },
    ): CancelablePromise<UploadProfileVideoResponseDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/profile/video',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * @param requestBody
     * @returns SupporterPreferencesResponseDto
     * @throws ApiError
     */
    public static supporterPreferencesControllerUpdateV1(
        requestBody: UpdateSupporterPreferencesDto,
    ): CancelablePromise<SupporterPreferencesResponseDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/v1/profile/supporter-preferences',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns ProfilePresenceResponseDto
     * @throws ApiError
     */
    public static profilePresenceControllerGetPresenceV1(
        id: string,
    ): CancelablePromise<ProfilePresenceResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/profile/{id}/presence',
            path: {
                'id': id,
            },
        });
    }
}
