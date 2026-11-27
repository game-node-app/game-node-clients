/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type GuildChainStageDto = {
    index: number;
    stageKey: string;
    objectiveType: GuildChainStageDto.objectiveType;
    targetCount: number;
    criteria: Record<string, any>;
    xpReward: number;
    sealsReward: number;
    durationDays: number;
    usesBoundTargetGame: boolean;
};
export namespace GuildChainStageDto {
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

