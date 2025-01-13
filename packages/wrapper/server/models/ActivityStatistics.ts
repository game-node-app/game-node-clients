/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Activity } from './Activity';
import type { UserLike } from './UserLike';
import type { UserView } from './UserView';
export type ActivityStatistics = {
    views: Array<UserView>;
    likes: Array<UserLike>;
    activity: Activity;
    activityId: string;
    id: number;
    viewsCount: number;
    likesCount: number;
};

