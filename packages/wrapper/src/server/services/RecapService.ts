/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RecapCurrentDto } from '../models/RecapCurrentDto';
import type { RecapGoalDto } from '../models/RecapGoalDto';
import type { RecapStatusDto } from '../models/RecapStatusDto';
import type { RecapWindowDto } from '../models/RecapWindowDto';
import type { UpdateRecapEditionDto } from '../models/UpdateRecapEditionDto';
import type { UpdateRecapGoalDto } from '../models/UpdateRecapGoalDto';
import type { YearRecapDto } from '../models/YearRecapDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RecapService {
    /**
     * Returns the current Recap year, its phase and its opening and closing dates.
     * @returns RecapCurrentDto
     * @throws ApiError
     */
    public static recapControllerGetCurrentRecapV1(): CancelablePromise<RecapCurrentDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/recap/current',
        });
    }
    /**
     * Reads the authenticated user's goal and progress for a year.
     * Declared before :year/:userId so "goals" is not read as a year.
     * @param year
     * @returns RecapGoalDto
     * @throws ApiError
     */
    public static recapControllerGetGoalV1(
        year: number,
    ): CancelablePromise<RecapGoalDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/recap/goals/{year}',
            path: {
                'year': year,
            },
        });
    }
    /**
     * Sets or replaces the authenticated user's finished-games target.
     * @param year
     * @param requestBody
     * @returns RecapGoalDto
     * @throws ApiError
     */
    public static recapControllerSetGoalV1(
        year: number,
        requestBody: UpdateRecapGoalDto,
    ): CancelablePromise<RecapGoalDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/recap/goals/{year}',
            path: {
                'year': year,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
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
    /**
     * @param year
     * @param requestBody
     * @returns RecapWindowDto
     * @throws ApiError
     */
    public static recapAdminControllerUpdateEditionV1(
        year: number,
        requestBody: UpdateRecapEditionDto,
    ): CancelablePromise<RecapWindowDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/recap/admin/editions/{year}',
            path: {
                'year': year,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
