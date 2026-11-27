/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GuildChainClaimProgressDto } from './GuildChainClaimProgressDto';
import type { GuildChestResultDto } from './GuildChestResultDto';
import type { GuildContractDto } from './GuildContractDto';
import type { GuildContractPassportMonthDto } from './GuildContractPassportMonthDto';
import type { GuildRewardDescriptorDto } from './GuildRewardDescriptorDto';
import type { LinaReceptionDto } from './LinaReceptionDto';
export type ClaimGuildContractResponseDto = {
    contract: GuildContractDto;
    xpAwarded: number;
    /**
     * Global UserLevel XP credited: floor(xpAwarded × 0.25)
     */
    globalXpAwarded: number;
    rankBefore: ClaimGuildContractResponseDto.rankBefore;
    rankAfter: ClaimGuildContractResponseDto.rankAfter;
    /**
     * Every Seal credited by this claim (contract + bonus + chest + prestige + chain)
     */
    sealsAwarded: number;
    bonusCompleted: boolean;
    unlockedRewards: Array<GuildRewardDescriptorDto>;
    chestResult: GuildChestResultDto | null;
    /**
     * Rank promotion packages crossed by this claim
     */
    promotionRewards: Array<GuildRewardDescriptorDto>;
    /**
     * Relic chests opened by newly reached Prestige stars
     */
    prestigeRewards: Array<GuildChestResultDto>;
    passportMonth: GuildContractPassportMonthDto;
    chainProgress: GuildChainClaimProgressDto | null;
    lina: LinaReceptionDto;
};
export namespace ClaimGuildContractResponseDto {
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

