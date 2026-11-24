/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateGuildEventDto } from '../models/CreateGuildEventDto';
import type { CreateGuildRewardDto } from '../models/CreateGuildRewardDto';
import type { GuildAdminEventResponseDto } from '../models/GuildAdminEventResponseDto';
import type { GuildAdminRewardResponseDto } from '../models/GuildAdminRewardResponseDto';
import type { UpdateGuildEventDto } from '../models/UpdateGuildEventDto';
import type { UpdateGuildRewardDto } from '../models/UpdateGuildRewardDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class GuildAdminService {
    /**
     * @returns GuildAdminEventResponseDto
     * @throws ApiError
     */
    public static guildAdminControllerListEventsV1(): CancelablePromise<Array<GuildAdminEventResponseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/guild/admin/events',
        });
    }
    /**
     * @param requestBody
     * @returns GuildAdminEventResponseDto
     * @throws ApiError
     */
    public static guildAdminControllerCreateEventV1(
        requestBody: CreateGuildEventDto,
    ): CancelablePromise<GuildAdminEventResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/guild/admin/events',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns GuildAdminEventResponseDto
     * @throws ApiError
     */
    public static guildAdminControllerGetEventV1(
        id: string,
    ): CancelablePromise<GuildAdminEventResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/guild/admin/events/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns GuildAdminEventResponseDto
     * @throws ApiError
     */
    public static guildAdminControllerUpdateEventV1(
        id: string,
        requestBody: UpdateGuildEventDto,
    ): CancelablePromise<GuildAdminEventResponseDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/v1/guild/admin/events/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns GuildAdminEventResponseDto
     * @throws ApiError
     */
    public static guildAdminControllerPublishEventV1(
        id: string,
    ): CancelablePromise<GuildAdminEventResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/guild/admin/events/{id}/publish',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @returns GuildAdminEventResponseDto
     * @throws ApiError
     */
    public static guildAdminControllerArchiveEventV1(
        id: string,
    ): CancelablePromise<GuildAdminEventResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/guild/admin/events/{id}/archive',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns GuildAdminRewardResponseDto
     * @throws ApiError
     */
    public static guildAdminControllerListRewardsV1(): CancelablePromise<Array<GuildAdminRewardResponseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/guild/admin/rewards',
        });
    }
    /**
     * @param requestBody
     * @returns GuildAdminRewardResponseDto
     * @throws ApiError
     */
    public static guildAdminControllerCreateRewardV1(
        requestBody: CreateGuildRewardDto,
    ): CancelablePromise<GuildAdminRewardResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/guild/admin/rewards',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns GuildAdminRewardResponseDto
     * @throws ApiError
     */
    public static guildAdminControllerUpdateRewardV1(
        id: string,
        requestBody: UpdateGuildRewardDto,
    ): CancelablePromise<GuildAdminRewardResponseDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/v1/guild/admin/rewards/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
