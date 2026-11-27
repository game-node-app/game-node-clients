/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type GuildActiveChainSummaryDto = {
    chainKey: Record<string, any>;
    status: GuildActiveChainSummaryDto.status;
    currentStageIndex: number;
    totalStages: number;
    boundTargetGameId: number | null;
    activeContractId: string | null;
};
export namespace GuildActiveChainSummaryDto {
    export enum status {
        IN_PROGRESS = 'in_progress',
        COMPLETED = 'completed',
    }
}

