/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type NotificationAwardsTargetDto = {
    type: NotificationAwardsTargetDto.type;
    eventId: number;
    year: number;
    phase: NotificationAwardsTargetDto.phase;
};
export namespace NotificationAwardsTargetDto {
    export enum type {
        AWARDS = 'awards',
    }
    export enum phase {
        NOMINATIONS = 'nominations',
        VOTING = 'voting',
        RESULTS = 'results',
    }
}

