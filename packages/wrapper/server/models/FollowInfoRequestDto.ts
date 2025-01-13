/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type FollowInfoRequestDto = {
    criteria: FollowInfoRequestDto.criteria;
    targetUserId: string;
    offset?: number;
    limit?: number;
    orderBy?: Record<string, any>;
};
export namespace FollowInfoRequestDto {
    export enum criteria {
        FOLLOWERS = 'followers',
        FOLLOWING = 'following',
    }
}

