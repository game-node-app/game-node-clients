/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GetJournalHeatmapResponseDto } from '../models/GetJournalHeatmapResponseDto';
import type { JournalOverviewResponseDto } from '../models/JournalOverviewResponseDto';
import type { JournalPlaylogGroupDto } from '../models/JournalPlaylogGroupDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class JournalService {
    /**
     * @param userId
     * @returns JournalOverviewResponseDto
     * @throws ApiError
     */
    public static journalControllerGetJournalOverviewV1(
        userId: string,
    ): CancelablePromise<JournalOverviewResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/journal/overview/{userId}',
            path: {
                'userId': userId,
            },
        });
    }
    /**
     * @param userId
     * @param gameId
     * @returns JournalPlaylogGroupDto
     * @throws ApiError
     */
    public static journalControllerGetJournalPlaylogV1(
        userId: string,
        gameId: number,
    ): CancelablePromise<Array<JournalPlaylogGroupDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/journal/playlog/{userId}/{gameId}',
            path: {
                'userId': userId,
                'gameId': gameId,
            },
        });
    }
    /**
     * @param userId
     * @returns GetJournalHeatmapResponseDto
     * @throws ApiError
     */
    public static journalControllerGetHeatmapV1(
        userId: string,
    ): CancelablePromise<GetJournalHeatmapResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/journal/heatmap/{userId}',
            path: {
                'userId': userId,
            },
        });
    }
}
