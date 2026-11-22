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
    quests: Array<GuildBoardQuestDto>;
};

