/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GuildRewardDescriptorDto } from './GuildRewardDescriptorDto';
export type GuildAdminEmporiumItemResponseDto = {
    id: string;
    reward: GuildRewardDescriptorDto;
    priceSeals: number;
    minRank: GuildAdminEmporiumItemResponseDto.minRank;
    isRotating: boolean;
    maxPurchasesPerMonth: number | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};
export namespace GuildAdminEmporiumItemResponseDto {
    export enum minRank {
        E = 'E',
        D = 'D',
        C = 'C',
        B = 'B',
        A = 'A',
        S = 'S',
    }
}

