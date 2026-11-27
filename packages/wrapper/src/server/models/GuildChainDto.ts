/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GuildChainBoundGameDto } from './GuildChainBoundGameDto';
import type { GuildChainStageDto } from './GuildChainStageDto';
import type { GuildRewardDescriptorDto } from './GuildRewardDescriptorDto';
export type GuildChainDto = {
    chainKey: Record<string, any>;
    titleKey: string;
    minRank: GuildChainDto.minRank;
    status: GuildChainDto.status;
    currentStageIndex: number;
    totalStages: number;
    boundTargetGameId: number | null;
    boundGame: GuildChainBoundGameDto | null;
    activeContractId: string | null;
    stages: Array<GuildChainStageDto>;
    finalRewards: Array<GuildRewardDescriptorDto>;
    finalBonusSeals: number;
};
export namespace GuildChainDto {
    export enum minRank {
        E = 'E',
        D = 'D',
        C = 'C',
        B = 'B',
        A = 'A',
        S = 'S',
    }
    export enum status {
        LOCKED = 'locked',
        AVAILABLE = 'available',
        IN_PROGRESS = 'in_progress',
        COMPLETED = 'completed',
    }
}

