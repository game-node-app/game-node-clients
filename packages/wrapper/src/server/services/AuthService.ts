/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthService {
    /**
     * @returns any
     * @throws ApiError
     */
    public static authControllerLogoutV1(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/auth/logout',
        });
    }
    /**
     * @returns any List of linked providers
     * @throws ApiError
     */
    public static authControllerGetLinkedProvidersV1(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/auth/providers',
        });
    }
    /**
     * @param providerId
     * @returns any
     * @throws ApiError
     */
    public static authControllerUnlinkProviderV1(
        providerId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/auth/providers/{providerId}',
            path: {
                'providerId': providerId,
            },
            errors: {
                400: `Cannot unlink last provider or provider not linked`,
            },
        });
    }
}
