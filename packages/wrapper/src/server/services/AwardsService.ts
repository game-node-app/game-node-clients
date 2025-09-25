/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AddCategorySuggestionDto } from '../models/AddCategorySuggestionDto';
import type { AwardsEvent } from '../models/AwardsEvent';
import type { AwardsVote } from '../models/AwardsVote';
import type { CreateUpdateAwardsCategoryDto } from '../models/CreateUpdateAwardsCategoryDto';
import type { CreateUpdateAwardsEventDto } from '../models/CreateUpdateAwardsEventDto';
import type { RegisterAwardsVoteDto } from '../models/RegisterAwardsVoteDto';
import type { VotableAwardsCategoryDto } from '../models/VotableAwardsCategoryDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AwardsService {
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static awardsAdminControllerCreateOrUpdateEventV1(
        requestBody: CreateUpdateAwardsEventDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/awards/admin/event',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static awardsAdminControllerCreateUpdateCategoryV1(
        requestBody: CreateUpdateAwardsCategoryDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/awards/admin/category',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static awardsAdminControllerAddCategorySuggestionV1(
        requestBody: AddCategorySuggestionDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/awards/admin/category/suggestion',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static awardsAdminControllerRemoveCategorySuggestionV1(
        requestBody: AddCategorySuggestionDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/awards/admin/category/suggestion',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param userId
     * @param categoryId
     * @returns AwardsVote
     * @throws ApiError
     */
    public static awardsVoteControllerGetVoteByUserIdV1(
        userId: string,
        categoryId: number,
    ): CancelablePromise<AwardsVote> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/awards/vote/{userId}/{categoryId}',
            path: {
                'userId': userId,
                'categoryId': categoryId,
            },
        });
    }
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static awardsVoteControllerRegisterVoteV1(
        requestBody: RegisterAwardsVoteDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/awards/vote',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns AwardsEvent
     * @throws ApiError
     */
    public static awardsControllerGetEventByIdV1(
        id: number,
    ): CancelablePromise<AwardsEvent> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/awards/events/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param year
     * @returns AwardsEvent
     * @throws ApiError
     */
    public static awardsControllerGetEventsByYearV1(
        year: number,
    ): CancelablePromise<AwardsEvent> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/awards/events/year/{year}',
            path: {
                'year': year,
            },
        });
    }
    /**
     * @returns AwardsEvent
     * @throws ApiError
     */
    public static awardsControllerGetEventsV1(): CancelablePromise<Array<AwardsEvent>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/awards/events',
        });
    }
    /**
     * @param eventId
     * @returns VotableAwardsCategoryDto
     * @throws ApiError
     */
    public static awardsControllerGetCategoriesByEventIdV1(
        eventId: number,
    ): CancelablePromise<Array<VotableAwardsCategoryDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/awards/{eventId}/categories',
            path: {
                'eventId': eventId,
            },
        });
    }
}
