/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProfileAvatar } from './ProfileAvatar';
export type DailyRankingRowDto = {
    /**
     * Positions moved since the same list without today's puzzles; "new" on a first counted result; null for `today`.
     */
    positionChange: (number | string) | null;
    avatar: ProfileAvatar | null;
    /**
     * Consecutive position in the filtered list, starting at 1.
     */
    position: number;
    userId: string;
    username: string;
    /**
     * Entitled supporter who has not hidden the badge.
     */
    supporterBadge: boolean;
    /**
     * Points with one decimal place.
     */
    points: number;
    /**
     * Percentage of counted results won, 0 to 100 with one decimal place.
     */
    winRate: number;
    /**
     * Overall rows only: points per mode with one decimal place.
     */
    modePoints?: Record<string, any>;
    /**
     * Overall rows only.
     */
    currentStreak?: number;
    /**
     * Mode rows only.
     */
    wins?: number;
    /**
     * Mode rows only; null without a counted win.
     */
    averageAttempts?: number | null;
    /**
     * Mode rows only, over all time.
     */
    bestStreak?: number;
};

