/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GuildChestResultDto } from './GuildChestResultDto';
import type { GuildRewardDescriptorDto } from './GuildRewardDescriptorDto';
export type ClaimGuildBountyResponseDto = {
    bountyId: string;
    claimedMilestones: Array<number>;
    newlyClaimedMilestones: Array<number>;
    /**
     * Flat milestone Seals plus chest Seal payouts.
     */
    sealsAwarded: number;
    xpAwarded: number;
    /**
     * floor(xpAwarded × 0.25)
     */
    globalXpAwarded: number;
    rankBefore: ClaimGuildBountyResponseDto.rankBefore;
    rankAfter: ClaimGuildBountyResponseDto.rankAfter;
    unlockedRewards: Array<GuildRewardDescriptorDto>;
    chestResults: Array<GuildChestResultDto>;
};
export namespace ClaimGuildBountyResponseDto {
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

