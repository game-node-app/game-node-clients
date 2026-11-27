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
    sealsReward: number;
    objectiveType: GuildContractDto.objectiveType;
    criteria: Record<string, any>;
    bonusObjective: Record<string, any> | null;
    bonusCompleted: boolean;
    extendedCount: number;
    chainProgressId: string | null;
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
        MONTHLY = 'monthly',
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
        LOG_PLAYTIME = 'log_playtime',
        PLAY_DISTINCT_DAYS = 'play_distinct_days',
        DAILY_CHALLENGE = 'daily_challenge',
        EARN_GAME_ACHIEVEMENTS = 'earn_game_achievements',
        COMPLETE_GAME_100 = 'complete_game_100',
        CURATE_COLLECTION = 'curate_collection',
        PUBLISH_POST = 'publish_post',
        TRIAGE_BACKLOG = 'triage_backlog',
    }
    export enum status {
        ACTIVE = 'active',
        READY_TO_CLAIM = 'ready_to_claim',
        COMPLETED = 'completed',
        ABANDONED = 'abandoned',
        EXPIRED = 'expired',
    }
}

