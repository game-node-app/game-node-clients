/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type JournalEntryDetailsDto = {
    /**
     * UUID of the collection entry
     */
    collectionEntryId: string;
    /**
     * ID of the game
     */
    gameId: number;
    /**
     * Status of the game (e.g., Finished, Started, etc.)
     */
    status: JournalEntryDetailsDto.status;
};
export namespace JournalEntryDetailsDto {
    /**
     * Status of the game (e.g., Finished, Started, etc.)
     */
    export enum status {
        PLAYING = 'playing',
        FINISHED = 'finished',
        PLANNED = 'planned',
        DROPPED = 'dropped',
    }
}

