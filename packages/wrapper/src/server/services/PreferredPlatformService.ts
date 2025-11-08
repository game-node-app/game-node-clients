/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreatePreferredPlatformDto } from '../models/CreatePreferredPlatformDto';
import type { PreferredPlatformDto } from '../models/PreferredPlatformDto';
import type { UpdatePreferredPlatformOrderDto } from '../models/UpdatePreferredPlatformOrderDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PreferredPlatformService {
    /**
     * @returns PreferredPlatformDto
     * @throws ApiError
     */
    public static preferredPlatformControllerFindAllByUserIdV1(): CancelablePromise<Array<PreferredPlatformDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/preferred-platform',
        });
    }
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static preferredPlatformControllerCreateOrUpdateV1(
        requestBody: CreatePreferredPlatformDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/preferred-platform',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static preferredPlatformControllerUpdateOrderV1(
        requestBody: UpdatePreferredPlatformOrderDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/v1/preferred-platform/order',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param platformId
     * @returns any
     * @throws ApiError
     */
    public static preferredPlatformControllerDeletePreferredPlatformV1(
        platformId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/preferred-platform/{platformId}',
            path: {
                'platformId': platformId,
            },
        });
    }
}
