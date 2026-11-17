/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UpdateProfileDto = {
    libraryVisibility?: UpdateProfileDto.libraryVisibility;
    customCoverMode?: UpdateProfileDto.customCoverMode;
    username?: string;
    bio?: string;
};
export namespace UpdateProfileDto {
    export enum libraryVisibility {
        PUBLIC = 'public',
        FOLLOWERS = 'followers',
        PRIVATE = 'private',
    }
    export enum customCoverMode {
        ANY = 'any',
        PREFER_YOURS = 'prefer_yours',
        NONE = 'none',
    }
}

