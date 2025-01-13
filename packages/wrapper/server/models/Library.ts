/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Collection } from './Collection';
export type Library = {
    /**
     * @description The primary key of the library entity.
     * Also used to share the library with other users.
     *
     * Same as SuperTokens' userId.
     */
    userId: string;
    collections: Array<Collection>;
    createdAt: string;
    updatedAt: string;
};

