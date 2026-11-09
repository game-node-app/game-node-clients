/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProfileAvatar } from './ProfileAvatar';
import type { ProfileBanner } from './ProfileBanner';
import type { ProfileVideoResponseDto } from './ProfileVideoResponseDto';
import type { ProfileVideoUploadsResponseDto } from './ProfileVideoUploadsResponseDto';
export type ProfileResponseDto = {
    customCoverMode: ProfileResponseDto.customCoverMode;
    avatarVideo: ProfileVideoResponseDto | null;
    bannerVideo: ProfileVideoResponseDto | null;
    /**
     * Owner-only; absent from `GET /v1/profile/:id`.
     */
    videoUploads?: ProfileVideoUploadsResponseDto;
    /**
     * Shareable string ID
     *
     * Same as the Better Auth user id.
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
export namespace ProfileResponseDto {
    export enum customCoverMode {
        ANY = 'any',
        PREFER_YOURS = 'prefer_yours',
        NONE = 'none',
    }
}

