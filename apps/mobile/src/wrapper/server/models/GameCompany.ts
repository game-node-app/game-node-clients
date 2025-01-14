/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GameCompanyLogo } from './GameCompanyLogo';
export type GameCompany = {
    id: number;
    changeDate?: string;
    changeDateCategory?: string;
    changedCompany?: GameCompany;
    checksum?: string;
    country?: number;
    createdAt: string;
    description?: string;
    logo?: GameCompanyLogo;
    name: string;
    parent?: GameCompany;
    slug: string;
    startDate?: string;
    startDateCategory?: string;
    updatedAt: string;
    url?: string;
};

