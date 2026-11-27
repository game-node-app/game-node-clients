/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type GuildBoardBonusObjectiveDto = {
    type: GuildBoardBonusObjectiveDto.type;
    /**
     * Minimum plain-text review length (also_write_review)
     */
    minChars?: number;
    /**
     * Backlog age required from the target game
     */
    staleDays?: number;
    bonusXp?: number;
    bonusSeals?: number;
    /**
     * Upgrades the contract chest one tier on claim
     */
    upgradeChestTier?: boolean;
};
export namespace GuildBoardBonusObjectiveDto {
    export enum type {
        ALSO_WRITE_REVIEW = 'also_write_review',
        FINISH_BEFORE_HALF_DEADLINE = 'finish_before_half_deadline',
        USE_STALE_BACKLOG_GAME = 'use_stale_backlog_game',
    }
}

