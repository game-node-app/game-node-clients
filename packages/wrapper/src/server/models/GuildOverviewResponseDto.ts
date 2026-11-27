/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GuildActiveChainSummaryDto } from './GuildActiveChainSummaryDto';
import type { GuildContractDto } from './GuildContractDto';
import type { GuildLicenseDto } from './GuildLicenseDto';
import type { GuildOverviewCountsDto } from './GuildOverviewCountsDto';
import type { GuildPassportSummaryDto } from './GuildPassportSummaryDto';
import type { GuildYearGoalDto } from './GuildYearGoalDto';
import type { LinaReceptionDto } from './LinaReceptionDto';
export type GuildOverviewResponseDto = {
    license: GuildLicenseDto;
    activeContracts: Array<GuildContractDto>;
    yearGoal: GuildYearGoalDto | null;
    counts: GuildOverviewCountsDto;
    /**
     * Monday of the board week in America/Sao_Paulo
     */
    weekStart: string;
    /**
     * Next Monday 00:00 America/Sao_Paulo, in UTC
     */
    nextRefreshAt: string;
    lina: LinaReceptionDto;
    passport: GuildPassportSummaryDto;
    activeChain: GuildActiveChainSummaryDto | null;
    activeBountiesCount: number;
};

