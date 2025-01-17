export type FollowInfoRequestDto = {
    criteria: FollowInfoRequestDto.criteria;
    targetUserId: string;
    offset?: number;
    limit?: number;
    orderBy?: Record<string, any>;
};
export declare namespace FollowInfoRequestDto {
    enum criteria {
        FOLLOWERS = "followers",
        FOLLOWING = "following"
    }
}
//# sourceMappingURL=FollowInfoRequestDto.d.ts.map