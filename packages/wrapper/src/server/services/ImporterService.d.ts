import type { ImporterPaginatedResponseDto } from '../models/ImporterPaginatedResponseDto';
import type { ImporterStatusUpdateRequestDto } from '../models/ImporterStatusUpdateRequestDto';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class ImporterService {
    /**
     * @param source
     * @param limit
     * @param offset
     * @returns ImporterPaginatedResponseDto
     * @throws ApiError
     */
    static importerControllerFindUnprocessedEntriesV1(source: string, limit?: number, offset?: number): CancelablePromise<ImporterPaginatedResponseDto>;
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    static importerControllerChangeStatusV1(requestBody: ImporterStatusUpdateRequestDto): CancelablePromise<any>;
}
//# sourceMappingURL=ImporterService.d.ts.map