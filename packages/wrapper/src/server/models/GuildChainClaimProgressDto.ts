/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GuildRewardDescriptorDto } from './GuildRewardDescriptorDto';
export type GuildChainClaimProgressDto = {
    chainKey: Record<string, any>;
    currentStageIndex: number;
    status: GuildChainClaimProgressDto.status;
    chainCompleted: boolean;
    finalRewards: Array<GuildRewardDescriptorDto>;
    bonusSealsAwarded: number;
};
export namespace GuildChainClaimProgressDto {
    export enum status {
        IN_PROGRESS = 'in_progress',
        COMPLETED = 'completed',
    }
}

