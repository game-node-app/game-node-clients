/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GameAchievementWithObtainedInfo } from './GameAchievementWithObtainedInfo';
export type JournalPlaylogEntryDto = {
    gameId: number;
    type: JournalPlaylogEntryDto.type;
    /**
     * Only available for 'type' of 'collection_entry_status'
     */
    entryStatus?: JournalPlaylogEntryDto.entryStatus;
    /**
     * Only available for 'type' of 'obtained_achievement'
     */
    obtainedAchievement?: GameAchievementWithObtainedInfo;
    /**
     * The {@link GamePlatform}s this entry relates to.
     */
    platformIds: Array<number>;
    /**
     * Date for the staus of 'collection_entry_status', and date the achievement was obtained for 'obtained_achievement'
     * In 'DD-MM-YYYY' format.
     */
    date: string;
};
export namespace JournalPlaylogEntryDto {
    export enum type {
        COLLECTION_ENTRY_STATUS = 'collection_entry_status',
        OBTAINED_ACHIEVEMENT = 'obtained_achievement',
    }
    /**
     * Only available for 'type' of 'collection_entry_status'
     */
    export enum entryStatus {
        PLAYING = 'playing',
        FINISHED = 'finished',
        PLANNED = 'planned',
        DROPPED = 'dropped',
    }
}

