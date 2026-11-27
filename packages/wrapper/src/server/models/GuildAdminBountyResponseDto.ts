/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GuildBountyTranslationDto } from './GuildBountyTranslationDto';
export type GuildAdminBountyResponseDto = {
    id: string;
    slug: string;
    title: string;
    description: string;
    objectiveType: GuildAdminBountyResponseDto.objectiveType;
    criteria: Record<string, any>;
    targetTotal: number;
    currentTotal: number;
    minUserContribution: number;
    maxUserContributionCap: number;
    milestoneRewards: Record<string, any>;
    startsAt: string;
    endsAt: string;
    status: GuildAdminBountyResponseDto.status;
    publishedAt: string | null;
    reached100At: string | null;
    translations: Array<GuildBountyTranslationDto>;
    createdAt: string;
    updatedAt: string;
};
export namespace GuildAdminBountyResponseDto {
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

