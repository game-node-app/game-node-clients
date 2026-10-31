/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AchievementIconDto = {
    kind: AchievementIconDto.kind;
    /**
     * Glyph name (kebab-case) or name of an existing icon in public/icons
     */
    name?: string;
    gameId?: number;
};
export namespace AchievementIconDto {
    export enum kind {
        GLYPH = 'glyph',
        GAME_COVER = 'game_cover',
        IMAGE = 'image',
    }
}

