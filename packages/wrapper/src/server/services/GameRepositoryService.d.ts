import type { Game } from '../models/Game';
import type { GameExternalStoreDto } from '../models/GameExternalStoreDto';
import type { GameRepositoryFindAllDto } from '../models/GameRepositoryFindAllDto';
import type { GameRepositoryFindOneDto } from '../models/GameRepositoryFindOneDto';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class GameRepositoryService {
    /**
     * @param resourceName
     * @returns any
     * @throws ApiError
     */
    static gameRepositoryControllerGetResourceV1(resourceName: string): CancelablePromise<Record<string, any>>;
    /**
     * @param id
     * @returns string
     * @throws ApiError
     */
    static gameRepositoryControllerGetIconNamesForPlatformAbbreviationsV1(id: number): CancelablePromise<Array<string>>;
    /**
     * @param id
     * @returns GameExternalStoreDto
     * @throws ApiError
     */
    static gameRepositoryControllerGetExternalStoresForGameIdV1(id: number): CancelablePromise<Array<GameExternalStoreDto>>;
    /**
     * @param id
     * @param requestBody
     * @returns Game
     * @throws ApiError
     */
    static gameRepositoryControllerFindOneByIdV1(id: number, requestBody: GameRepositoryFindOneDto): CancelablePromise<Game>;
    /**
     * @param requestBody
     * @returns Game
     * @throws ApiError
     */
    static gameRepositoryControllerFindAllByIdsV1(requestBody: GameRepositoryFindAllDto): CancelablePromise<Array<Game>>;
}
//# sourceMappingURL=GameRepositoryService.d.ts.map