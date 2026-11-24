/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
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
     * Stable system template key; clients localize the copy
     */
    templateKey: string | null;
    title: string | null;
    description: string | null;
    translations: Array<GuildBoardEventTranslationDto>;
    rank: GuildBoardQuestDto.rank;
    xpReward: number;
    objectiveType: GuildBoardQuestDto.objectiveType;
    targetCount: number;
    criteria: Record<string, any>;
    candidateGames: Array<GuildBoardCandidateGameDto>;
    meta: GuildBoardQuestMetaDto | null;
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
}

