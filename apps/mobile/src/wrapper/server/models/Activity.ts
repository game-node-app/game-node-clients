/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Collection } from './Collection';
import type { CollectionEntry } from './CollectionEntry';
import type { Profile } from './Profile';
import type { Review } from './Review';
import type { UserFollow } from './UserFollow';
export type Activity = {
    id: string;
    type: Activity.type;
    /**
     * The associated profile with this Activity (e.g. user who performed an action)
     */
    profile: Profile;
    profileUserId: string;
    collectionEntry: CollectionEntry | null;
    collectionEntryId: string | null;
    collection: Collection | null;
    collectionId: string | null;
    review: Review | null;
    reviewId: string | null;
    userFollow: UserFollow | null;
    userFollowId: number | null;
    createdAt: string;
    updatedAt: string;
};
export namespace Activity {
    export enum type {
        REVIEW = 'REVIEW',
        FOLLOW = 'FOLLOW',
        COLLECTION_ENTRY = 'COLLECTION_ENTRY',
    }
}

