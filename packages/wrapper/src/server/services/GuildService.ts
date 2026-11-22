/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AcceptGuildContractDto } from '../models/AcceptGuildContractDto';
import type { AcceptGuildContractResponseDto } from '../models/AcceptGuildContractResponseDto';
import type { ClaimGuildContractResponseDto } from '../models/ClaimGuildContractResponseDto';
import type { GuildAccessResponseDto } from '../models/GuildAccessResponseDto';
import type { GuildBoardResponseDto } from '../models/GuildBoardResponseDto';
import type { GuildBoardSeenResponseDto } from '../models/GuildBoardSeenResponseDto';
import type { GuildContractDto } from '../models/GuildContractDto';
import type { GuildContractsListResponseDto } from '../models/GuildContractsListResponseDto';
import type { GuildCosmeticsResponseDto } from '../models/GuildCosmeticsResponseDto';
import type { GuildOverviewResponseDto } from '../models/GuildOverviewResponseDto';
import type { GuildRewardsResponseDto } from '../models/GuildRewardsResponseDto';
import type { UpdateGuildCosmeticsDto } from '../models/UpdateGuildCosmeticsDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class GuildService {
    /**
     * @returns GuildAccessResponseDto
     * @throws ApiError
     */
    public static guildControllerGetAccessV1(): CancelablePromise<GuildAccessResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/guild/access',
        });
    }
    /**
     * @returns GuildOverviewResponseDto
     * @throws ApiError
     */
    public static guildControllerGetOverviewV1(): CancelablePromise<GuildOverviewResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/guild',
        });
    }
    /**
     * @param quick Return only quick quests (rank D/E, short weekly quests or quick platform tasks), easiest first.
     * @returns GuildBoardResponseDto
     * @throws ApiError
     */
    public static guildControllerGetBoardV1(
        quick?: boolean,
    ): CancelablePromise<GuildBoardResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/guild/board',
            query: {
                'quick': quick,
            },
        });
    }
    /**
     * @returns GuildBoardSeenResponseDto
     * @throws ApiError
     */
    public static guildControllerMarkBoardSeenV1(): CancelablePromise<GuildBoardSeenResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/guild/board/seen',
        });
    }
    /**
     * @param status
     * @param tab accepted = active + ready_to_claim (ready first); completed = completed only
     * @param offset
     * @param limit
     * @returns GuildContractsListResponseDto
     * @throws ApiError
     */
    public static guildControllerListContractsV1(
        status?: 'active' | 'ready_to_claim' | 'completed' | 'abandoned' | 'expired',
        tab?: 'accepted' | 'completed',
        offset?: number,
        limit: number = 20,
    ): CancelablePromise<GuildContractsListResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/guild/contracts',
            query: {
                'status': status,
                'tab': tab,
                'offset': offset,
                'limit': limit,
            },
        });
    }
    /**
     * @param requestBody
     * @returns AcceptGuildContractResponseDto
     * @throws ApiError
     */
    public static guildControllerAcceptContractV1(
        requestBody: AcceptGuildContractDto,
    ): CancelablePromise<AcceptGuildContractResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/guild/contracts',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns ClaimGuildContractResponseDto
     * @throws ApiError
     */
    public static guildControllerClaimContractV1(
        id: string,
    ): CancelablePromise<ClaimGuildContractResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/guild/contracts/{id}/claim',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @returns GuildContractDto
     * @throws ApiError
     */
    public static guildControllerAbandonContractV1(
        id: string,
    ): CancelablePromise<GuildContractDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/guild/contracts/{id}/abandon',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns GuildRewardsResponseDto
     * @throws ApiError
     */
    public static guildControllerGetRewardsV1(): CancelablePromise<GuildRewardsResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/guild/rewards',
        });
    }
    /**
     * @param requestBody
     * @returns GuildCosmeticsResponseDto
     * @throws ApiError
     */
    public static guildControllerUpdateCosmeticsV1(
        requestBody: UpdateGuildCosmeticsDto,
    ): CancelablePromise<GuildCosmeticsResponseDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/v1/guild/cosmetics',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
