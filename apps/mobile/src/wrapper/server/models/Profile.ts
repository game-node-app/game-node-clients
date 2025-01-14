/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProfileAvatar } from './ProfileAvatar';
import type { ProfileBanner } from './ProfileBanner';
export type Profile = {
    /**
     * Shareable string ID
     *
     * Same as SuperTokens' userId.
     */
    userId: string;
    username: string;
    bio: string;
    avatar: ProfileAvatar | null;
    banner: ProfileBanner | null;
    usernameLastUpdatedAt: string | null;
    createdAt: string;
    updatedAt: string;
};

