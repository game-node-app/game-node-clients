/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type StatisticsRankingItemDto = {
    sourceType: StatisticsRankingItemDto.sourceType;
    sourceId: (string | number);
    score: number;
    viewsCount: number;
    likesCount: number;
};
export namespace StatisticsRankingItemDto {
    export enum sourceType {
        GAME = 'game',
        REVIEW = 'review',
    }
}

