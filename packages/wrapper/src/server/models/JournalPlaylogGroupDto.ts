/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { JournalPlaylogEntryDto } from './JournalPlaylogEntryDto';
export type JournalPlaylogGroupDto = {
    /**
     * Date used as criteria to group related entries.
     * In 'DD-MM-YYYY' format.
     * Entries will be grouped by this.
     */
    date: string;
    /**
     * Type used as criteria to group related entries.
     * Entries will be grouped by this.
     */
    type: JournalPlaylogGroupDto.type;
    /**
     * The {@link GamePlatform}s this entry relates to.
     * <strong>THIS IS NOT USED AS A GROUPING KEY.</strong>
     */
    platformIds: Array<number>;
    entries: Array<JournalPlaylogEntryDto>;
};
export namespace JournalPlaylogGroupDto {
    /**
     * Type used as criteria to group related entries.
     * Entries will be grouped by this.
     */
    export enum type {
        COLLECTION_ENTRY_STATUS = 'collection_entry_status',
        OBTAINED_ACHIEVEMENT = 'obtained_achievement',
    }
}

