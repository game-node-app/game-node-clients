/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Library } from '../models/Library';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class LibrariesService {
    /**
     * @returns Library
     * @throws ApiError
     */
    public static librariesControllerFindOwnV1(): CancelablePromise<Library> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/libraries',
        });
    }
    /**
     * @param id
     * @returns Library
     * @throws ApiError
     */
    public static librariesControllerFindOneByIdWithPermissionsV1(
        id: string,
    ): CancelablePromise<Library> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/libraries/{id}',
            path: {
                'id': id,
            },
        });
    }
}
