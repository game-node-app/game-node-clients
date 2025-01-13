/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { schema_GameSearchRequestDto } from '../models/schema_GameSearchRequestDto';
import type { schema_GameSearchResponseDto } from '../models/schema_GameSearchResponseDto';
import type { schema_UserSearchRequestDto } from '../models/schema_UserSearchRequestDto';
import type { schema_UserSearchResponseDto } from '../models/schema_UserSearchResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SearchService {
    /**
     * Searches for games using Manticore engine
     * Returns a parsed search response from the Manticore engine
     * @param query Account ID
     * @returns schema_GameSearchResponseDto OK
     * @throws ApiError
     */
    public static postSearchGames(
        query: schema_GameSearchRequestDto,
    ): CancelablePromise<schema_GameSearchResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/search/games',
            body: query,
        });
    }
    /**
     * Searches for users using Manticore engine
     * Returns a parsed search response from the Manticore engine
     * @param query Account ID
     * @returns schema_UserSearchResponseDto OK
     * @throws ApiError
     */
    public static postSearchUsers(
        query: schema_UserSearchRequestDto,
    ): CancelablePromise<schema_UserSearchResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/search/users',
            body: query,
        });
    }
}
