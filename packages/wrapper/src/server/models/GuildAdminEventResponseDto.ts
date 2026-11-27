/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GuildEventTranslationDto } from './GuildEventTranslationDto';
import type { GuildRewardDescriptorDto } from './GuildRewardDescriptorDto';
export type GuildAdminEventResponseDto = {
    id: string;
    slug: string;
    title: string;
    description: string;
    rank: GuildAdminEventResponseDto.rank;
    xpReward: number;
    objectiveType: GuildAdminEventResponseDto.objectiveType;
    sealsReward: number;
    targetCount: number;
    criteria: Record<string, any>;
    bonusObjective: Record<string, any> | null;
    reward: GuildRewardDescriptorDto | null;
    startsAt: string;
    endsAt: string;
    status: GuildAdminEventResponseDto.status;
    publishedAt: string | null;
    translations: Array<GuildEventTranslationDto>;
    createdAt: string;
    updatedAt: string;
};
export namespace GuildAdminEventResponseDto {
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
        DRAFT = 'draft',
        PUBLISHED = 'published',
        ARCHIVED = 'archived',
    }
}

