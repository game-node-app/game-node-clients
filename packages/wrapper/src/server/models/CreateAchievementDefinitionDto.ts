/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AchievementIconDto } from './AchievementIconDto';
import type { AchievementTierInputDto } from './AchievementTierInputDto';
export type CreateAchievementDefinitionDto = {
    category: CreateAchievementDefinitionDto.category;
    criteria: Record<string, any>;
    /**
     * Stable slug, also used as the achievement id
     */
    id: string;
    name: string;
    description: string;
    /**
     * Key of a metric listed by GET /achievements/admin/metrics
     */
    metric: string;
    startsAt?: string | null;
    endsAt?: string | null;
    eventId?: string | null;
    icon: AchievementIconDto;
    isHidden?: boolean;
    /**
     * Tiers in ascending threshold order. After publishing, existing tiers must be resent unchanged and new ones appended.
     */
    tiers: Array<AchievementTierInputDto>;
};
export namespace CreateAchievementDefinitionDto {
    export enum category {
        '_0' = 0,
        '_1' = 1,
        '_2' = 2,
        '_3' = 3,
        '_4' = 4,
        '_5' = 5,
    }
}

