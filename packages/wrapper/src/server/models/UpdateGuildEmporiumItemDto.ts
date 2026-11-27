/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UpdateGuildEmporiumItemDto = {
    rewardId?: string;
    priceSeals?: number;
    minRank?: UpdateGuildEmporiumItemDto.minRank;
    isRotating?: boolean;
    maxPurchasesPerMonth?: number | null;
    isActive?: boolean;
};
export namespace UpdateGuildEmporiumItemDto {
    export enum minRank {
        E = 'E',
        D = 'D',
        C = 'C',
        B = 'B',
        A = 'A',
        S = 'S',
    }
}

