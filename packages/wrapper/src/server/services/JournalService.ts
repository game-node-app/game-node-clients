/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { JournalEntriesGroupedDto } from '../models/JournalEntriesGroupedDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class JournalService {
    /**
     * @param userId
     * @returns JournalEntriesGroupedDto
     * @throws ApiError
     */
    public static journalControllerGetJournalOverviewV1(
        userId: string,
    ): CancelablePromise<JournalEntriesGroupedDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/journal/overview/{userId}',
            path: {
                'userId': userId,
            },
        });
    }
}
