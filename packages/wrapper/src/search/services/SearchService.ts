/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { games_GameAutocompleteRequestDto } from '../models/games_GameAutocompleteRequestDto';
import type { games_GameAutocompleteResponseDto } from '../models/games_GameAutocompleteResponseDto';
import type { games_GameSearchRequestDto } from '../models/games_GameSearchRequestDto';
import type { games_GameSearchResponseDto } from '../models/games_GameSearchResponseDto';
import type { users_UserSearchRequestDto } from '../models/users_UserSearchRequestDto';
import type { users_UserSearchResponseDto } from '../models/users_UserSearchResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SearchService {
    /**
     * Searches for games using Manticore engine
     * Returns a parsed search response from the Manticore engine
     * @param query Request body
     * @returns games_GameSearchResponseDto OK
     * @throws ApiError
     */
    public static postSearchGames(
        query: games_GameSearchRequestDto,
    ): CancelablePromise<games_GameSearchResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/search/games',
            body: query,
        });
    }
    /**
     * Autocomplete games names using Manticore engine
     * Returns a parsed search response from the Manticore engine
     * @param query Request body
     * @returns games_GameAutocompleteResponseDto OK
     * @throws ApiError
     */
    public static postSearchGamesAutocomplete(
        query: games_GameAutocompleteRequestDto,
    ): CancelablePromise<games_GameAutocompleteResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/search/games/autocomplete',
            body: query,
        });
    }
    /**
     * Searches for users using Manticore engine
     * Returns a parsed search response from the Manticore engine
     * @param query Account ID
     * @returns users_UserSearchResponseDto OK
     * @throws ApiError
     */
    public static postSearchUsers(
        query: users_UserSearchRequestDto,
    ): CancelablePromise<users_UserSearchResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/search/users',
            body: query,
        });
    }
}
