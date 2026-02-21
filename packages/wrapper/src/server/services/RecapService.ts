/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RecapStatusDto } from '../models/RecapStatusDto';
import type { YearRecapDto } from '../models/YearRecapDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RecapService {
    /**
     * Given a userID, returns the recap status for the current year.
     * This includes whether the recap is created and if the user is eligible for the recap.
     * The eligibility is determined by the user's account creation date and the target year.
     * @param userId
     * @param year
     * @returns RecapStatusDto
     * @throws ApiError
     */
    public static recapControllerGetRecapStatusV1(
        userId: string,
        year: number,
    ): CancelablePromise<RecapStatusDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/recap/{year}/{userId}/status',
            path: {
                'userId': userId,
                'year': year,
            },
        });
    }
    /**
     * Given a year and userId, returns the actual recap data for that user in that year.
     * @param userId
     * @param year
     * @returns YearRecapDto
     * @throws ApiError
     */
    public static recapControllerGetRecapByYearV1(
        userId: string,
        year: number,
    ): CancelablePromise<YearRecapDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/recap/{year}/{userId}',
            path: {
                'userId': userId,
                'year': year,
            },
        });
    }
}
