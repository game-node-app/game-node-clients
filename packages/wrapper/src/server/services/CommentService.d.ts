import type { ActivityComment } from '../models/ActivityComment';
import type { CreateCommentDto } from '../models/CreateCommentDto';
import type { DeleteCommentDto } from '../models/DeleteCommentDto';
import type { FindAllCommentsDto } from '../models/FindAllCommentsDto';
import type { FindCommentsPaginatedResponseDto } from '../models/FindCommentsPaginatedResponseDto';
import type { Object } from '../models/Object';
import type { ReviewComment } from '../models/ReviewComment';
import type { UpdateCommentDto } from '../models/UpdateCommentDto';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class CommentService {
    /**
     * @param requestBody
     * @returns FindCommentsPaginatedResponseDto
     * @throws ApiError
     */
    static commentControllerFindAllV1(requestBody: FindAllCommentsDto): CancelablePromise<FindCommentsPaginatedResponseDto>;
    /**
     * @param sourceType
     * @param id
     * @returns any
     * @throws ApiError
     */
    static commentControllerFindOneByIdV1(sourceType: string, id: string): CancelablePromise<(ReviewComment | ActivityComment)>;
    /**
     * @param sourceType
     * @param id
     * @param search
     * @param offset
     * @param limit
     * @param orderBy
     * @returns any
     * @throws ApiError
     */
    static commentControllerFindAllChildrenByIdV1(sourceType: string, id: string, search?: string, offset?: number, limit?: number, orderBy?: Object): CancelablePromise<Record<string, any>>;
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    static commentControllerCreateV1(requestBody: CreateCommentDto): CancelablePromise<any>;
    /**
     * @param id
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    static commentControllerUpdateV1(id: string, requestBody: UpdateCommentDto): CancelablePromise<void>;
    /**
     * @param id
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    static commentControllerDeleteV1(id: string, requestBody: DeleteCommentDto): CancelablePromise<any>;
}
//# sourceMappingURL=CommentService.d.ts.map