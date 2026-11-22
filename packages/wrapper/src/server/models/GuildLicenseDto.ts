/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GuildLicenseStatsDto } from './GuildLicenseStatsDto';
export type GuildLicenseDto = {
    licenseNumber: number;
    rank: GuildLicenseDto.rank;
    xp: number;
    currentRankMinXp: number;
    nextRank: GuildLicenseDto.nextRank | null;
    nextRankXp: number | null;
    xpToNextRank: number;
    memberSince: string;
    equippedTitleKey: string | null;
    equippedFrameKey: string | null;
    stats: GuildLicenseStatsDto;
};
export namespace GuildLicenseDto {
    export enum rank {
        E = 'E',
        D = 'D',
        C = 'C',
        B = 'B',
        A = 'A',
        S = 'S',
    }
    export enum nextRank {
        E = 'E',
        D = 'D',
        C = 'C',
        B = 'B',
        A = 'A',
        S = 'S',
    }
}

