/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AchievementEventDto } from './AchievementEventDto';
import type { AchievementIconDto } from './AchievementIconDto';
import type { AchievementTierV2Dto } from './AchievementTierV2Dto';
export type AchievementV2Dto = {
    category: AchievementV2Dto.category;
    criteria: Record<string, any> | null;
    id: string;
    /**
     * Hidden achievements not obtained by the target user have name, description, metric, criteria and icon set to null
     */
    isHidden: boolean;
    name: string | null;
    description: string | null;
    metric: string | null;
    icon: AchievementIconDto | null;
    event: AchievementEventDto | null;
    /**
     * Effective time window (the event's, when the achievement belongs to one)
     */
    startsAt: string | null;
    endsAt: string | null;
    tiers: Array<AchievementTierV2Dto>;
};
export namespace AchievementV2Dto {
    export enum category {
        '_0' = 0,
        '_1' = 1,
        '_2' = 2,
        '_3' = 3,
        '_4' = 4,
        '_5' = 5,
    }
}

