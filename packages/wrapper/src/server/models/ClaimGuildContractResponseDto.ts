/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GuildChestResultDto } from './GuildChestResultDto';
import type { GuildContractDto } from './GuildContractDto';
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
    unlockedRewards: Array<GuildRewardDescriptorDto>;
    chestResult: GuildChestResultDto | null;
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

