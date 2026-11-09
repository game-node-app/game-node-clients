/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GameCoverImageDto } from './GameCoverImageDto';
export type GameCoverOptionResponseDto = {
    /**
     * Cover option id used when choosing it
     */
    id: number;
    kind: GameCoverOptionResponseDto.kind;
    label: string | null;
    image: GameCoverImageDto;
};
export namespace GameCoverOptionResponseDto {
    export enum kind {
        LOCALIZED = 'localized',
        EDITION = 'edition',
        ALTERNATIVE = 'alternative',
        HISTORICAL = 'historical',
    }
}

