/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Profile } from './Profile';
export type UserFollow = {
    id: number;
    /**
     * User that is following another user.
     */
    follower: Profile;
    /**
     * User that is following another user.
     */
    followerUserId: string;
    /**
     * User that is being followed
     */
    followed: Profile;
    /**
     * User that is being followed
     */
    followedUserId: string;
    createdAt: string;
    updatedAt: string;
};

