/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GuildRewardDescriptorDto } from './GuildRewardDescriptorDto';
export type GuildEmporiumListingDto = {
    id: string;
    priceSeals: number;
    minRank: GuildEmporiumListingDto.minRank;
    isRotating: boolean;
    reward: GuildRewardDescriptorDto;
    /**
     * Null when the listing has no monthly purchase cap.
     */
    maxPurchasesPerMonth: number | null;
    /**
     * Already unlocked permanently; repeatable rewards (consumables, chests) are never owned.
     */
    owned: boolean;
    purchasedThisMonth: number;
    /**
     * The buyer has the rank, the Seals and an open monthly purchase slot.
     */
    canPurchase: boolean;
};
export namespace GuildEmporiumListingDto {
    export enum minRank {
        E = 'E',
        D = 'D',
        C = 'C',
        B = 'B',
        A = 'A',
        S = 'S',
    }
}

