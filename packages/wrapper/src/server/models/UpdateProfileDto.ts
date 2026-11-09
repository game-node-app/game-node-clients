/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UpdateProfileDto = {
    customCoverMode?: UpdateProfileDto.customCoverMode;
    username?: string;
    bio?: string;
};
export namespace UpdateProfileDto {
    export enum customCoverMode {
        ANY = 'any',
        PREFER_YOURS = 'prefer_yours',
        NONE = 'none',
    }
}

