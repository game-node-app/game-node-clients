/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type DailySetColumnDto = {
    match: DailySetColumnDto.match;
    /**
     * The guess's own values.
     */
    values: Array<string>;
};
export namespace DailySetColumnDto {
    export enum match {
        MATCH = 'match',
        PARTIAL = 'partial',
        NONE = 'none',
    }
}

