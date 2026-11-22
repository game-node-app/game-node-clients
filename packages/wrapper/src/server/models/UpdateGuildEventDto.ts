/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GuildEventTranslationDto } from './GuildEventTranslationDto';
export type UpdateGuildEventDto = {
    slug?: string;
    title?: string;
    description?: string;
    rank?: UpdateGuildEventDto.rank;
    xpReward?: number;
    objectiveType?: UpdateGuildEventDto.objectiveType;
    targetCount?: number;
    /**
     * Objective filters; see validateGuildQuestRules.
     */
    criteria?: Record<string, any>;
    rewardId?: string | null;
    startsAt?: string;
    endsAt?: string;
    /**
     * Omitted preserves stored translations; [] clears them.
     */
    translations?: Array<GuildEventTranslationDto>;
};
export namespace UpdateGuildEventDto {
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

