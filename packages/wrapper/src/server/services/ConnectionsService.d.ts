import type { ConnectionCreateDto } from '../models/ConnectionCreateDto';
import type { FindAvailableConnectionsResponseDto } from '../models/FindAvailableConnectionsResponseDto';
import type { UserConnectionDto } from '../models/UserConnectionDto';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class ConnectionsService {
    /**
     * @returns FindAvailableConnectionsResponseDto
     * @throws ApiError
     */
    static connectionsControllerFindAvailableConnectionsV1(): CancelablePromise<Array<FindAvailableConnectionsResponseDto>>;
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    static connectionsControllerCreateOrUpdateV1(requestBody: ConnectionCreateDto): CancelablePromise<any>;
    /**
     * @returns UserConnectionDto
     * @throws ApiError
     */
    static connectionsControllerFindOwnV1(): CancelablePromise<Array<UserConnectionDto>>;
    /**
     * @param type
     * @returns UserConnectionDto
     * @throws ApiError
     */
    static connectionsControllerFindOwnByTypeV1(type: string): CancelablePromise<UserConnectionDto>;
    /**
     * @param id
     * @returns any
     * @throws ApiError
     */
    static connectionsControllerDeleteV1(id: number): CancelablePromise<any>;
}
//# sourceMappingURL=ConnectionsService.d.ts.map