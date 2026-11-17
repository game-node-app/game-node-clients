/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProfileAvatar } from './ProfileAvatar';
export type DailyWeeklyRankingRowDto = {
    avatar: ProfileAvatar | null;
    userId: string;
    username: string;
    supporterBadge: boolean;
    status: DailyWeeklyRankingRowDto.status;
    attempts: number;
    finishedAt: string | null;
};
export namespace DailyWeeklyRankingRowDto {
    export enum status {
        IN_PROGRESS = 'in_progress',
        WON = 'won',
        LOST = 'lost',
    }
}

