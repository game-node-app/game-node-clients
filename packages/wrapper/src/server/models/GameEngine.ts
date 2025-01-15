/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Game } from './Game';
import type { GameCompany } from './GameCompany';
import type { GameEngineLogo } from './GameEngineLogo';
import type { GamePlatform } from './GamePlatform';
export type GameEngine = {
    logo: GameEngineLogo;
    companies: Array<GameCompany>;
    platforms: Array<GamePlatform>;
    games: Array<Game>;
    id: number;
    checksum?: string;
    name?: string;
    slug?: string;
    url?: string;
    createdAt: string;
    updatedAt: string;
};

