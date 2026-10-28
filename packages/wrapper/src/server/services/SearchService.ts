/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GameAutocompleteRequestDto } from '../models/GameAutocompleteRequestDto';
import type { GameAutocompleteResponseDto } from '../models/GameAutocompleteResponseDto';
import type { GameSearchRequestDto } from '../models/GameSearchRequestDto';
import type { GameSearchResponseDto } from '../models/GameSearchResponseDto';
import type { UserSearchRequestDto } from '../models/UserSearchRequestDto';
import type { UserSearchResponseDto } from '../models/UserSearchResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SearchService {
    /**
     * Searches for games using Manticore engine
     * Returns a parsed search response from the Manticore engine. Bounds: query <= 256 chars; filter arrays <= 100 entries; filter strings <= 256 chars; limit 1-100 (default 20 when omitted/0); page >= 1 (default 1 when omitted/0); effective offset ((page - 1) * limit) <= 10000.
     * @param requestBody
     * @returns GameSearchResponseDto
     * @throws ApiError
     */
    public static searchControllerSearchGames0V1(
        requestBody: GameSearchRequestDto,
    ): CancelablePromise<GameSearchResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/search/games',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Malformed JSON body, invalid field type, out-of-range enum, string/array length overflow, or pagination/offset out of bounds.`,
            },
        });
    }
    /**
     * Searches for games using Manticore engine
     * Returns a parsed search response from the Manticore engine. Bounds: query <= 256 chars; filter arrays <= 100 entries; filter strings <= 256 chars; limit 1-100 (default 20 when omitted/0); page >= 1 (default 1 when omitted/0); effective offset ((page - 1) * limit) <= 10000.
     * @param requestBody
     * @returns GameSearchResponseDto
     * @throws ApiError
     */
    public static searchControllerSearchGames1(
        requestBody: GameSearchRequestDto,
    ): CancelablePromise<GameSearchResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/search/games',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Malformed JSON body, invalid field type, out-of-range enum, string/array length overflow, or pagination/offset out of bounds.`,
            },
        });
    }
    /**
     * Autocomplete games names using Manticore engine
     * Returns up to 5 matching game names from page 1. Validates request fields with the same bounds as game search (query <= 256 chars, filters <= 100 entries, limit <= 100, offset <= 10000) and short-circuits empty/omitted queries without an engine request.
     * @param requestBody
     * @returns GameAutocompleteResponseDto
     * @throws ApiError
     */
    public static searchControllerAutocompleteGames0V1(
        requestBody: GameAutocompleteRequestDto,
    ): CancelablePromise<GameAutocompleteResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/search/games/autocomplete',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Malformed JSON body, invalid field type, out-of-range enum, string/array length overflow, or pagination/offset out of bounds.`,
            },
        });
    }
    /**
     * Autocomplete games names using Manticore engine
     * Returns up to 5 matching game names from page 1. Validates request fields with the same bounds as game search (query <= 256 chars, filters <= 100 entries, limit <= 100, offset <= 10000) and short-circuits empty/omitted queries without an engine request.
     * @param requestBody
     * @returns GameAutocompleteResponseDto
     * @throws ApiError
     */
    public static searchControllerAutocompleteGames1(
        requestBody: GameAutocompleteRequestDto,
    ): CancelablePromise<GameAutocompleteResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/search/games/autocomplete',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Malformed JSON body, invalid field type, out-of-range enum, string/array length overflow, or pagination/offset out of bounds.`,
            },
        });
    }
    /**
     * Searches for users using Manticore engine
     * Returns public usernames and userIds matching a nonblank username prefix. Bounds: nonblank query <= 256 chars; limit 1-100 (default 20 when omitted/0); page >= 1 (default 1 when omitted/0); effective offset ((page - 1) * limit) <= 10000.
     * @param requestBody
     * @returns UserSearchResponseDto
     * @throws ApiError
     */
    public static searchControllerSearchUsers0V1(
        requestBody: UserSearchRequestDto,
    ): CancelablePromise<UserSearchResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/search/users',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Malformed JSON body, blank or oversized query, invalid field type, or pagination/offset out of bounds.`,
            },
        });
    }
    /**
     * Searches for users using Manticore engine
     * Returns public usernames and userIds matching a nonblank username prefix. Bounds: nonblank query <= 256 chars; limit 1-100 (default 20 when omitted/0); page >= 1 (default 1 when omitted/0); effective offset ((page - 1) * limit) <= 10000.
     * @param requestBody
     * @returns UserSearchResponseDto
     * @throws ApiError
     */
    public static searchControllerSearchUsers1(
        requestBody: UserSearchRequestDto,
    ): CancelablePromise<UserSearchResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/search/users',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Malformed JSON body, blank or oversized query, invalid field type, or pagination/offset out of bounds.`,
            },
        });
    }
}
