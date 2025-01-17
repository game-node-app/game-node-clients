import type { CreateReviewDto } from '../models/CreateReviewDto';
import type { FindAllReviewsByIdDto } from '../models/FindAllReviewsByIdDto';
import type { FindReviewPaginatedDto } from '../models/FindReviewPaginatedDto';
import type { Object } from '../models/Object';
import type { Review } from '../models/Review';
import type { ReviewScoreResponseDto } from '../models/ReviewScoreResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class ReviewsService {
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    static reviewsControllerCreateOrUpdateV1(requestBody: CreateReviewDto): CancelablePromise<any>;
    /**
     * @param id
     * @param gameId
     * @returns Review
     * @throws ApiError
     */
    static reviewsControllerFindOneByUserIdAndGameIdV1(id: string, gameId: number): CancelablePromise<Review>;
    /**
     * @param requestBody
     * @returns Review
     * @throws ApiError
     */
    static reviewsControllerFindAllByIdV1(requestBody: FindAllReviewsByIdDto): CancelablePromise<Array<Review>>;
    /**
     * @param gameId
     * @returns ReviewScoreResponseDto
     * @throws ApiError
     */
    static reviewsControllerGetScoreForGameIdV1(gameId: number): CancelablePromise<ReviewScoreResponseDto>;
    /**
     * @param userId
     * @param offset
     * @param limit
     * @param orderBy
     * @returns FindReviewPaginatedDto
     * @throws ApiError
     */
    static reviewsControllerFindAllByUserIdV1(userId: string, offset?: number, limit?: number, orderBy?: Object): CancelablePromise<FindReviewPaginatedDto>;
    /**
     * @param id
     * @param offset
     * @param limit
     * @param orderBy
     * @returns FindReviewPaginatedDto
     * @throws ApiError
     */
    static reviewsControllerFindAllByGameIdV1(id: number, offset?: number, limit?: number, orderBy?: Object): CancelablePromise<FindReviewPaginatedDto>;
    /**
     * @param id
     * @returns Review
     * @throws ApiError
     */
    static reviewsControllerFindOneByIdV1(id: string): CancelablePromise<Review>;
    /**
     * @param id
     * @returns any
     * @throws ApiError
     */
    static reviewsControllerDeleteV1(id: string): CancelablePromise<any>;
}
//# sourceMappingURL=ReviewsService.d.ts.map