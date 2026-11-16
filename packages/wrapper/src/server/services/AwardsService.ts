/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AddCategorySuggestionDto } from '../models/AddCategorySuggestionDto';
import type { AwardsBallotDto } from '../models/AwardsBallotDto';
import type { AwardsCategoryResult } from '../models/AwardsCategoryResult';
import type { AwardsEventDto } from '../models/AwardsEventDto';
import type { AwardsUserVoteDto } from '../models/AwardsUserVoteDto';
import type { AwardsVote } from '../models/AwardsVote';
import type { CreateUpdateAwardsCategoryDto } from '../models/CreateUpdateAwardsCategoryDto';
import type { CreateUpdateAwardsEventDto } from '../models/CreateUpdateAwardsEventDto';
import type { CurrentAwardsEventDto } from '../models/CurrentAwardsEventDto';
import type { RegisterAwardsVoteDto } from '../models/RegisterAwardsVoteDto';
import type { UpdateNominationsDto } from '../models/UpdateNominationsDto';
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
     * @param eventId
     * @returns AwardsVote
     * @throws ApiError
     */
    public static awardsVoteControllerGetRecentVotesByEventIdV1(
        eventId: number,
    ): CancelablePromise<Array<AwardsVote>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/awards/vote/{eventId}/recent',
            path: {
                'eventId': eventId,
            },
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
     * @returns CurrentAwardsEventDto
     * @throws ApiError
     */
    public static awardsControllerGetCurrentEventV1(): CancelablePromise<CurrentAwardsEventDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/awards/events/current',
        });
    }
    /**
     * @param id
     * @returns AwardsEventDto
     * @throws ApiError
     */
    public static awardsControllerGetEventByIdV1(
        id: number,
    ): CancelablePromise<AwardsEventDto> {
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
     * @returns AwardsEventDto
     * @throws ApiError
     */
    public static awardsControllerGetEventsByYearV1(
        year: number,
    ): CancelablePromise<AwardsEventDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/awards/events/year/{year}',
            path: {
                'year': year,
            },
        });
    }
    /**
     * @returns AwardsEventDto
     * @throws ApiError
     */
    public static awardsControllerGetEventsV1(): CancelablePromise<Array<AwardsEventDto>> {
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
    /**
     * @param eventId
     * @returns AwardsCategoryResult
     * @throws ApiError
     */
    public static awardsControllerGetResultsByEventIdV1(
        eventId: number,
    ): CancelablePromise<Array<AwardsCategoryResult>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/awards/{eventId}/results',
            path: {
                'eventId': eventId,
            },
        });
    }
    /**
     * @param eventId
     * @param userId
     * @returns any
     * @throws ApiError
     */
    public static awardsControllerGetScoreboardV1(
        eventId: number,
        userId: string,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/awards/{eventId}/scoreboard/{userId}',
            path: {
                'eventId': eventId,
                'userId': userId,
            },
        });
    }
    /**
     * @param eventId
     * @returns any
     * @throws ApiError
     */
    public static awardsNominationControllerGetMyNominationsV1(
        eventId: number,
    ): CancelablePromise<Array<Record<string, any>>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/awards/{eventId}/nominations/me',
            path: {
                'eventId': eventId,
            },
        });
    }
    /**
     * @param eventId
     * @param categoryId
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static awardsNominationControllerReplaceNominationsV1(
        eventId: number,
        categoryId: number,
        requestBody: UpdateNominationsDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/awards/{eventId}/nominations/{categoryId}',
            path: {
                'eventId': eventId,
                'categoryId': categoryId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param eventId
     * @returns AwardsBallotDto
     * @throws ApiError
     */
    public static awardsBallotControllerGetBallotV1(
        eventId: number,
    ): CancelablePromise<AwardsBallotDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/awards/{eventId}/ballot',
            path: {
                'eventId': eventId,
            },
        });
    }
    /**
     * @param eventId
     * @param userId
     * @returns AwardsUserVoteDto
     * @throws ApiError
     */
    public static awardsBallotControllerGetVotesByUserIdV1(
        eventId: number,
        userId: string,
    ): CancelablePromise<Array<AwardsUserVoteDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/awards/{eventId}/votes/{userId}',
            path: {
                'eventId': eventId,
                'userId': userId,
            },
        });
    }
}
