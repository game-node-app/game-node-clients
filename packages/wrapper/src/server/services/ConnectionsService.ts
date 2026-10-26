/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ConnectionAuthCallbackDto } from '../models/ConnectionAuthCallbackDto';
import type { ConnectionAuthInitDto } from '../models/ConnectionAuthInitDto';
import type { ConnectionAuthInitResponseDto } from '../models/ConnectionAuthInitResponseDto';
import type { ConnectionCreateDto } from '../models/ConnectionCreateDto';
import type { ConnectionSettingsUpdateDto } from '../models/ConnectionSettingsUpdateDto';
import type { FindAvailableConnectionsResponseDto } from '../models/FindAvailableConnectionsResponseDto';
import type { UserConnectionDto } from '../models/UserConnectionDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ConnectionsService {
    /**
     * @returns FindAvailableConnectionsResponseDto
     * @throws ApiError
     */
    public static connectionsControllerFindAvailableConnectionsV1(): CancelablePromise<Array<FindAvailableConnectionsResponseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/connections',
        });
    }
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static connectionsControllerCreateOrUpdateV1(
        requestBody: ConnectionCreateDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/connections',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns UserConnectionDto
     * @throws ApiError
     */
    public static connectionsControllerFindOwnV1(): CancelablePromise<Array<UserConnectionDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/connections/own',
        });
    }
    /**
     * @param type
     * @returns UserConnectionDto
     * @throws ApiError
     */
    public static connectionsControllerFindOwnByTypeV1(
        type: string,
    ): CancelablePromise<UserConnectionDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/connections/own/{type}',
            path: {
                'type': type,
            },
        });
    }
    /**
     * @param userId
     * @returns UserConnectionDto
     * @throws ApiError
     */
    public static connectionsControllerFindAllByUserIdV1(
        userId: string,
    ): CancelablePromise<Array<UserConnectionDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/connections/user/{userId}',
            path: {
                'userId': userId,
            },
        });
    }
    /**
     * @param userId
     * @param type
     * @returns UserConnectionDto
     * @throws ApiError
     */
    public static connectionsControllerFindOneByUserIdAndTypeV1(
        userId: string,
        type: string,
    ): CancelablePromise<UserConnectionDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/connections/user/{userId}/{type}',
            path: {
                'userId': userId,
                'type': type,
            },
        });
    }
    /**
     * @param id
     * @returns any
     * @throws ApiError
     */
    public static connectionsControllerDeleteV1(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/connections/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns UserConnectionDto
     * @throws ApiError
     */
    public static connectionsControllerUpdateSettingsV1(
        id: number,
        requestBody: ConnectionSettingsUpdateDto,
    ): CancelablePromise<UserConnectionDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/v1/connections/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param type
     * @param requestBody
     * @returns ConnectionAuthInitResponseDto
     * @throws ApiError
     */
    public static connectionsControllerInitRedirectAuthV1(
        type: string,
        requestBody: ConnectionAuthInitDto,
    ): CancelablePromise<ConnectionAuthInitResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/connections/{type}/auth/init',
            path: {
                'type': type,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param type
     * @param requestBody
     * @returns UserConnectionDto
     * @throws ApiError
     */
    public static connectionsControllerCompleteRedirectAuthV1(
        type: string,
        requestBody: ConnectionAuthCallbackDto,
    ): CancelablePromise<UserConnectionDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/connections/{type}/auth/callback',
            path: {
                'type': type,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param type
     * @param requestBody
     * @returns UserConnectionDto
     * @throws ApiError
     */
    public static connectionsControllerUpdateOwnSettingsV1(
        type: string,
        requestBody: ConnectionSettingsUpdateDto,
    ): CancelablePromise<UserConnectionDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/v1/connections/own/{type}/settings',
            path: {
                'type': type,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
