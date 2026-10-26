/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type NotificationActivityContentDto = {
    type: NotificationActivityContentDto.type;
    id: string;
};
export namespace NotificationActivityContentDto {
    export enum type {
        POST = 'post',
        REVIEW = 'review',
        COLLECTION_ENTRY = 'collection_entry',
        COLLECTION = 'collection',
        FOLLOW = 'follow',
        ACHIEVEMENT = 'achievement',
    }
}

