/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Game } from './Game';
import type { UserLike } from './UserLike';
import type { UserView } from './UserView';
export type GameStatistics = {
    views: Array<UserView>;
    likes: Array<UserLike>;
    game: Game;
    gameId: number;
    id: number;
    viewsCount: number;
    likesCount: number;
};

