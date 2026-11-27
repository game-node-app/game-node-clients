/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GuildBoardQuestDto } from './GuildBoardQuestDto';
export type GuildBoardResponseDto = {
    /**
     * Monday of the board week in America/Sao_Paulo
     */
    weekStart: string;
    /**
     * Next Monday 00:00 America/Sao_Paulo, in UTC
     */
    nextRefreshAt: string;
    /**
     * Free weekly rerolls left for the current São Paulo week
     */
    rerollsRemaining: number;
    /**
     * Owned `reroll_charter` consumables
     */
    rerollChartersOwned: number;
    /**
     * True below Rank C, when the Monthly Expedition slot is not generated
     */
    monthlyExpeditionLocked: boolean;
    quests: Array<GuildBoardQuestDto>;
};

