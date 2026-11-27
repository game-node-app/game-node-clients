/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GuildBoardBonusObjectiveDto } from './GuildBoardBonusObjectiveDto';
import type { GuildBoardCandidateGameDto } from './GuildBoardCandidateGameDto';
import type { GuildBoardEventTranslationDto } from './GuildBoardEventTranslationDto';
import type { GuildBoardQuestMetaDto } from './GuildBoardQuestMetaDto';
import type { GuildRewardDescriptorDto } from './GuildRewardDescriptorDto';
export type GuildBoardQuestDto = {
    sourceType: GuildBoardQuestDto.sourceType;
    boardEntryId: string | null;
    eventId: string | null;
    slug: string | null;
    category: GuildBoardQuestDto.category;
    /**
     * weekly for automatic board quests, monthly for expeditions, null for curated events
     */
    cycle: GuildBoardQuestDto.cycle | null;
    /**
     * Stable system template key; clients localize the copy
     */
    templateKey: string | null;
    title: string | null;
    description: string | null;
    translations: Array<GuildBoardEventTranslationDto>;
    rank: GuildBoardQuestDto.rank;
    xpReward: number;
    sealsReward: number;
    objectiveType: GuildBoardQuestDto.objectiveType;
    targetCount: number;
    criteria: Record<string, any>;
    candidateGames: Array<GuildBoardCandidateGameDto>;
    meta: GuildBoardQuestMetaDto | null;
    bonusObjective: GuildBoardBonusObjectiveDto | null;
    /**
     * How many times this slot was rerolled this week
     */
    rerollCount: number;
    requiresTargetGame: boolean;
    reward: GuildRewardDescriptorDto | null;
    isRecommended: boolean;
    isQuick: boolean;
    /**
     * Days an accepted contract stays open; null for event quests
     */
    contractDurationDays: number | null;
    expiresAt: string;
};
export namespace GuildBoardQuestDto {
    export enum sourceType {
        BOARD_ENTRY = 'board_entry',
        EVENT = 'event',
    }
    export enum category {
        LIBRARY = 'library',
        EVENT = 'event',
        WEEKLY = 'weekly',
        GAMENODE = 'gamenode',
        MONTHLY = 'monthly',
    }
    /**
     * weekly for automatic board quests, monthly for expeditions, null for curated events
     */
    export enum cycle {
        WEEKLY = 'weekly',
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
}

