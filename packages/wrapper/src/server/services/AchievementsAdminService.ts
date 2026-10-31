/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AchievementDefinition } from '../models/AchievementDefinition';
import type { AchievementEvent } from '../models/AchievementEvent';
import type { AchievementMetricDto } from '../models/AchievementMetricDto';
import type { CreateAchievementDefinitionDto } from '../models/CreateAchievementDefinitionDto';
import type { CreateAchievementEventDto } from '../models/CreateAchievementEventDto';
import type { SimulateAchievementDefinitionDto } from '../models/SimulateAchievementDefinitionDto';
import type { SimulateAchievementDefinitionResponseDto } from '../models/SimulateAchievementDefinitionResponseDto';
import type { UpdateAchievementDefinitionDto } from '../models/UpdateAchievementDefinitionDto';
import type { UpdateAchievementEventDto } from '../models/UpdateAchievementEventDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AchievementsAdminService {
    /**
     * @returns AchievementMetricDto
     * @throws ApiError
     */
    public static achievementsAdminControllerGetMetricsV1(): CancelablePromise<Array<AchievementMetricDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/achievements/admin/metrics',
        });
    }
    /**
     * @returns AchievementDefinition
     * @throws ApiError
     */
    public static achievementsAdminControllerFindDefinitionsV1(): CancelablePromise<Array<AchievementDefinition>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/achievements/admin/definitions',
        });
    }
    /**
     * @param requestBody
     * @returns AchievementDefinition
     * @throws ApiError
     */
    public static achievementsAdminControllerCreateDefinitionV1(
        requestBody: CreateAchievementDefinitionDto,
    ): CancelablePromise<AchievementDefinition> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/achievements/admin/definitions',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns AchievementDefinition
     * @throws ApiError
     */
    public static achievementsAdminControllerFindDefinitionV1(
        id: string,
    ): CancelablePromise<AchievementDefinition> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/achievements/admin/definitions/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns AchievementDefinition
     * @throws ApiError
     */
    public static achievementsAdminControllerUpdateDefinitionV1(
        id: string,
        requestBody: UpdateAchievementDefinitionDto,
    ): CancelablePromise<AchievementDefinition> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/v1/achievements/admin/definitions/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns any
     * @throws ApiError
     */
    public static achievementsAdminControllerDeleteDefinitionV1(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/achievements/admin/definitions/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @returns AchievementDefinition
     * @throws ApiError
     */
    public static achievementsAdminControllerPublishDefinitionV1(
        id: string,
    ): CancelablePromise<AchievementDefinition> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/achievements/admin/definitions/{id}/publish',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @returns AchievementDefinition
     * @throws ApiError
     */
    public static achievementsAdminControllerArchiveDefinitionV1(
        id: string,
    ): CancelablePromise<AchievementDefinition> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/achievements/admin/definitions/{id}/archive',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns SimulateAchievementDefinitionResponseDto
     * @returns any
     * @throws ApiError
     */
    public static achievementsAdminControllerSimulateDefinitionV1(
        id: string,
        requestBody: SimulateAchievementDefinitionDto,
    ): CancelablePromise<SimulateAchievementDefinitionResponseDto | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/achievements/admin/definitions/{id}/simulate',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns AchievementEvent
     * @throws ApiError
     */
    public static achievementsAdminControllerFindEventsV1(): CancelablePromise<Array<AchievementEvent>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/achievements/admin/events',
        });
    }
    /**
     * @param requestBody
     * @returns AchievementEvent
     * @throws ApiError
     */
    public static achievementsAdminControllerCreateEventV1(
        requestBody: CreateAchievementEventDto,
    ): CancelablePromise<AchievementEvent> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/achievements/admin/events',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns AchievementEvent
     * @throws ApiError
     */
    public static achievementsAdminControllerFindEventV1(
        id: string,
    ): CancelablePromise<AchievementEvent> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/achievements/admin/events/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns AchievementEvent
     * @throws ApiError
     */
    public static achievementsAdminControllerUpdateEventV1(
        id: string,
        requestBody: UpdateAchievementEventDto,
    ): CancelablePromise<AchievementEvent> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/v1/achievements/admin/events/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns any
     * @throws ApiError
     */
    public static achievementsAdminControllerDeleteEventV1(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/achievements/admin/events/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @returns AchievementEvent
     * @throws ApiError
     */
    public static achievementsAdminControllerPublishEventV1(
        id: string,
    ): CancelablePromise<AchievementEvent> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/achievements/admin/events/{id}/publish',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @returns AchievementEvent
     * @throws ApiError
     */
    public static achievementsAdminControllerArchiveEventV1(
        id: string,
    ): CancelablePromise<AchievementEvent> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/achievements/admin/events/{id}/archive',
            path: {
                'id': id,
            },
        });
    }
}
