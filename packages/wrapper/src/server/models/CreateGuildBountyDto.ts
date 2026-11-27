/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GuildBountyMilestoneRewardDto } from './GuildBountyMilestoneRewardDto';
import type { GuildBountyTranslationDto } from './GuildBountyTranslationDto';
export type CreateGuildBountyDto = {
    slug: string;
    title: string;
    description: string;
    objectiveType: CreateGuildBountyDto.objectiveType;
    /**
     * Objective filters; see validateGuildQuestRules.
     */
    criteria?: Record<string, any>;
    targetTotal: number;
    minUserContribution?: number;
    maxUserContributionCap: number;
    /**
     * Milestone rewards keyed by "25", "50", "100" and "150"; missing keys default to {}.
     */
    milestoneRewards?: Record<string, GuildBountyMilestoneRewardDto>;
    startsAt: string;
    endsAt: string;
    /**
     * Both `en` and `pt-BR` translations are required.
     */
    translations: Array<GuildBountyTranslationDto>;
};
export namespace CreateGuildBountyDto {
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
}

