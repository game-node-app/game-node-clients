import type { ActivityComment } from './ActivityComment';
import type { PaginationInfo } from './PaginationInfo';
import type { ReviewComment } from './ReviewComment';
export type FindCommentsPaginatedResponseDto = {
    data: Array<(ReviewComment | ActivityComment)>;
    pagination: PaginationInfo;
};
//# sourceMappingURL=FindCommentsPaginatedResponseDto.d.ts.map