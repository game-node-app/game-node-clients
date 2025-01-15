/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Game } from './Game';
import type { GameCompany } from './GameCompany';
export type GameInvolvedCompany = {
    id: number;
    checksum?: string;
    company: GameCompany;
    companyId: number;
    createdAt: string;
    developer: boolean;
    porting: boolean;
    publisher: boolean;
    supporting: boolean;
    updatedAt: string;
    games: Array<Game>;
};

