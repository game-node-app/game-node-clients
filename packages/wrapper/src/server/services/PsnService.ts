/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RotatePsnNpssoDto } from '../models/RotatePsnNpssoDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PsnService {
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static psnAdminControllerRotateNpssoV1(
        requestBody: RotatePsnNpssoDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/psn/admin/npsso',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
