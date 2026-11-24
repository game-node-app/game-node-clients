/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GuildContractEventSummaryDto } from './GuildContractEventSummaryDto';
import type { GuildContractPlaytimeProgressDto } from './GuildContractPlaytimeProgressDto';
import type { GuildContractTargetGameDto } from './GuildContractTargetGameDto';
import type { GuildRewardDescriptorDto } from './GuildRewardDescriptorDto';
export type GuildContractDto = {
    id: string;
    boardEntryId: string | null;
    eventId: string | null;
    category: GuildContractDto.category;
    templateKey: string | null;
    rank: GuildContractDto.rank;
    xpReward: number;
    objectiveType: GuildContractDto.objectiveType;
    criteria: Record<string, any>;
    targetGameId: number | null;
    targetGame: GuildContractTargetGameDto | null;
    progressCurrent: number;
    progressTarget: number;
    status: GuildContractDto.status;
    playtimeProgress: GuildContractPlaytimeProgressDto | null;
    reward: GuildRewardDescriptorDto | null;
    event: GuildContractEventSummaryDto | null;
    claimPayload: Record<string, any> | null;
    acceptedAt: string;
    readyAt: string | null;
    claimedAt: string | null;
    expiresAt: string | null;
    createdAt: string;
    updatedAt: string;
};
export namespace GuildContractDto {
    export enum category {
        LIBRARY = 'library',
        EVENT = 'event',
        WEEKLY = 'weekly',
        GAMENODE = 'gamenode',
    }
    export enum rank {
        E = 'E',
        D = 'D',
        C = 'C',
        B = 'B',
        A = 'A',
        S = 'S',
    }
    export enum objectiveType {
        FINISH_GAME = 'finish_game',
        WRITE_REVIEW = 'write_review',
    }
    export enum status {
        ACTIVE = 'active',
        READY_TO_CLAIM = 'ready_to_claim',
        COMPLETED = 'completed',
        ABANDONED = 'abandoned',
        EXPIRED = 'expired',
    }
}

