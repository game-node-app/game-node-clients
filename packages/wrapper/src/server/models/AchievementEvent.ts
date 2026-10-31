/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AchievementEvent = {
    id: string;
    slug: string;
    name: string;
    description: string;
    startsAt: string;
    endsAt: string;
    status: AchievementEvent.status;
    createdAt: string;
    updatedAt: string;
};
export namespace AchievementEvent {
    export enum status {
        DRAFT = 'draft',
        PUBLISHED = 'published',
        ARCHIVED = 'archived',
    }
}

