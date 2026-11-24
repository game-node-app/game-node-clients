/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type LinaReceptionDto = {
    trigger: LinaReceptionDto.trigger;
    pose: LinaReceptionDto.pose;
    context: Record<string, any>;
    hasUnseenBoard: boolean;
};
export namespace LinaReceptionDto {
    export enum trigger {
        CONTRACT_ACCEPTED = 'contract_accepted',
        CONTRACT_CLAIMED = 'contract_claimed',
        CONTRACT_READY_TO_CLAIM = 'contract_ready_to_claim',
        RETURNING_AFTER_INACTIVITY = 'returning_after_inactivity',
        WEEKLY_BOARD_REFRESHED = 'weekly_board_refreshed',
        STALE_BACKLOG_GAME = 'stale_backlog_game',
        DEFAULT = 'default',
    }
    export enum pose {
        HAPPY = 'happy',
        NEUTRAL = 'neutral',
    }
}

