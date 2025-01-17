import type { CreateReportRequestDto } from '../models/CreateReportRequestDto';
import type { HandleReportRequestDto } from '../models/HandleReportRequestDto';
import type { PaginatedReportResponseDto } from '../models/PaginatedReportResponseDto';
import type { Report } from '../models/Report';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class ReportService {
    /**
     * @param includeClosed
     * @param offset
     * @param limit
     * @returns PaginatedReportResponseDto
     * @throws ApiError
     */
    static reportControllerFindAllByLatestV1(includeClosed?: boolean, offset?: number, limit?: number): CancelablePromise<PaginatedReportResponseDto>;
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    static reportControllerCreateV1(requestBody: CreateReportRequestDto): CancelablePromise<any>;
    /**
     * @param id
     * @returns Report
     * @throws ApiError
     */
    static reportControllerFindOneByIdV1(id: number): CancelablePromise<Report>;
    /**
     * @param id
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    static reportControllerHandleV1(id: number, requestBody: HandleReportRequestDto): CancelablePromise<any>;
}
//# sourceMappingURL=ReportService.d.ts.map