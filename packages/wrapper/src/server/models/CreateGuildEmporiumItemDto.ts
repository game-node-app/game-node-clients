/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateGuildEmporiumItemDto = {
    rewardId: string;
    priceSeals: number;
    minRank?: CreateGuildEmporiumItemDto.minRank;
    isRotating?: boolean;
    maxPurchasesPerMonth?: number | null;
    isActive?: boolean;
};
export namespace CreateGuildEmporiumItemDto {
    export enum minRank {
        E = 'E',
        D = 'D',
        C = 'C',
        B = 'B',
        A = 'A',
        S = 'S',
    }
}

