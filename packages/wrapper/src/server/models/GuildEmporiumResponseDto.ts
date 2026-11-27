/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GuildEmporiumListingDto } from './GuildEmporiumListingDto';
export type GuildEmporiumResponseDto = {
    sealsBalance: number;
    monthKey: string;
    nextRotationAt: string;
    permanentItems: Array<GuildEmporiumListingDto>;
    /**
     * Up to 6 items, identical for every user in the month.
     */
    rotatingItems: Array<GuildEmporiumListingDto>;
};

