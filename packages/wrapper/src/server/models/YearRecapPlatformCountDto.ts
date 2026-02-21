/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CollectionEntry } from './CollectionEntry';
import type { Game } from './Game';
export type YearRecapPlatformCountDto = {
    id: number;
    abbreviation: string;
    alternative_name: string;
    category: YearRecapPlatformCountDto.category;
    checksum: string;
    generation: number;
    name: string;
    createdAt: string;
    updatedAt: string;
    games: Array<Game>;
    collectionEntries: Array<CollectionEntry>;
    /**
     * Icon name for the platform
     * Only available if {@link getIconNameForPlatformAbbreviation} or {@link getIconNamesForPlatformAbbreviations} was used to set it
     */
    iconName?: string;
    count: number;
};
export namespace YearRecapPlatformCountDto {
    export enum category {
        '_1' = 1,
        '_2' = 2,
        '_3' = 3,
        '_4' = 4,
        '_5' = 5,
        '_6' = 6,
    }
}

