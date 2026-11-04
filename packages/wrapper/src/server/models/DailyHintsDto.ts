/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DailyRevealDto } from './DailyRevealDto';
import type { DailyYearRangeDto } from './DailyYearRangeDto';
export type DailyHintsDto = {
    /**
     * Signed tokens for GET /daily/images/:token, from the most pixelated level up.
     */
    imageTokens: Array<string>;
    keywords: Array<string>;
    yearRange?: DailyYearRangeDto;
    reveal?: DailyRevealDto;
};

