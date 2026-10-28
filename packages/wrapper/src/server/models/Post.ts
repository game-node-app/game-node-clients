/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Game } from './Game';
import type { Profile } from './Profile';
import type { StatisticsTarget } from './StatisticsTarget';
export type Post = {
    id: string;
    /**
     * The post HTML content
     */
    content: string;
    profile: Profile;
    profileUserId: string;
    game: Game;
    gameId: number;
    statisticsTarget: StatisticsTarget | null;
    statisticsTargetId: number | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};

