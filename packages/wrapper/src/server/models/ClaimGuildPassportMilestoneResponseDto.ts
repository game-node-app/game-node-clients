/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GuildChestResultDto } from './GuildChestResultDto';
export type ClaimGuildPassportMilestoneResponseDto = {
    monthKey: string;
    milestone: number;
    claimedMilestones: Array<number>;
    completedContractsCount: number;
    chestResult: GuildChestResultDto;
    /**
     * Flat milestone Seals plus the chest's Seal payout.
     */
    sealsAwarded: number;
    consumableKey: ClaimGuildPassportMilestoneResponseDto.consumableKey | null;
    consumableQuantity: number;
    /**
     * Guild XP from the chest.
     */
    xpAwarded: number;
    /**
     * Global UserLevel XP credited: floor(xpAwarded × 0.25)
     */
    globalXpAwarded: number;
    rankBefore: ClaimGuildPassportMilestoneResponseDto.rankBefore;
    rankAfter: ClaimGuildPassportMilestoneResponseDto.rankAfter;
};
export namespace ClaimGuildPassportMilestoneResponseDto {
    export enum consumableKey {
        HOURGLASS = 'hourglass',
        REROLL_CHARTER = 'reroll_charter',
        EXTRA_SLOT_PERMIT = 'extra_slot_permit',
    }
    export enum rankBefore {
        E = 'E',
        D = 'D',
        C = 'C',
        B = 'B',
        A = 'A',
        S = 'S',
    }
    export enum rankAfter {
        E = 'E',
        D = 'D',
        C = 'C',
        B = 'B',
        A = 'A',
        S = 'S',
    }
}

