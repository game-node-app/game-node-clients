/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GuildEventTranslationDto } from './GuildEventTranslationDto';
export type CreateGuildEventDto = {
    slug: string;
    title: string;
    description: string;
    rank: CreateGuildEventDto.rank;
    xpReward: number;
    objectiveType: CreateGuildEventDto.objectiveType;
    /**
     * Defaults to the rank economy payout (defaultSealsForRank).
     */
    sealsReward?: number;
    /**
     * Optional contract bonus objective; see validateGuildBonusObjective.
     */
    bonusObjective?: Record<string, any>;
    targetCount?: number;
    /**
     * Objective filters; see validateGuildQuestRules.
     */
    criteria?: Record<string, any>;
    rewardId?: string | null;
    startsAt: string;
    endsAt: string;
    /**
     * Omitted preserves stored translations; [] clears them.
     */
    translations?: Array<GuildEventTranslationDto>;
};
export namespace CreateGuildEventDto {
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
}

