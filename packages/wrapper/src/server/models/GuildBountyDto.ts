/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GuildBountyMilestoneStateDto } from './GuildBountyMilestoneStateDto';
export type GuildBountyDto = {
    id: string;
    slug: string;
    title: string;
    description: string;
    objectiveType: GuildBountyDto.objectiveType;
    targetTotal: number;
    currentTotal: number;
    progressPercent: number;
    startsAt: string;
    endsAt: string;
    status: GuildBountyDto.status;
    userContribution: number;
    minUserContribution: number;
    eligible: boolean;
    claimedMilestones: Array<number>;
    milestones: Array<GuildBountyMilestoneStateDto>;
    hasClaimableMilestones: boolean;
};
export namespace GuildBountyDto {
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

