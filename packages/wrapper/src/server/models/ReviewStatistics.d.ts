import type { Review } from './Review';
import type { UserLike } from './UserLike';
import type { UserView } from './UserView';
export type ReviewStatistics = {
    views: Array<UserView>;
    likes: Array<UserLike>;
    review: Review;
    reviewId: string;
    id: number;
    viewsCount: number;
    likesCount: number;
};
//# sourceMappingURL=ReviewStatistics.d.ts.map