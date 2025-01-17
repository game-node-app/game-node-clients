import type { schema_GameSearchRequestDto } from '../models/schema_GameSearchRequestDto';
import type { schema_GameSearchResponseDto } from '../models/schema_GameSearchResponseDto';
import type { schema_UserSearchRequestDto } from '../models/schema_UserSearchRequestDto';
import type { schema_UserSearchResponseDto } from '../models/schema_UserSearchResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class SearchService {
    /**
     * Searches for games using Manticore engine
     * Returns a parsed search response from the Manticore engine
     * @param query Account ID
     * @returns schema_GameSearchResponseDto OK
     * @throws ApiError
     */
    static postSearchGames(query: schema_GameSearchRequestDto): CancelablePromise<schema_GameSearchResponseDto>;
    /**
     * Searches for users using Manticore engine
     * Returns a parsed search response from the Manticore engine
     * @param query Account ID
     * @returns schema_UserSearchResponseDto OK
     * @throws ApiError
     */
    static postSearchUsers(query: schema_UserSearchRequestDto): CancelablePromise<schema_UserSearchResponseDto>;
}
//# sourceMappingURL=SearchService.d.ts.map