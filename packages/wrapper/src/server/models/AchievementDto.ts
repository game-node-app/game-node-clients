/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AchievementDto = {
    id: string;
    name: string;
    description: string;
    expGainAmount: number;
    category: AchievementDto.category;
};
export namespace AchievementDto {
    export enum category {
        '_0' = 0,
        '_1' = 1,
        '_2' = 2,
        '_3' = 3,
        '_4' = 4,
    }
}

