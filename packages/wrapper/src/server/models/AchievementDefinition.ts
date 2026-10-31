/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AchievementEvent } from './AchievementEvent';
import type { AchievementTier } from './AchievementTier';
export type AchievementDefinition = {
    id: string;
    name: string;
    description: string;
    category: AchievementDefinition.category;
    /**
     * Key of a metric registered in achievement-metrics.ts
     */
    metric: string;
    criteria: Record<string, any>;
    startsAt: string | null;
    endsAt: string | null;
    event: AchievementEvent | null;
    eventId: string | null;
    icon: Record<string, any>;
    isHidden: boolean;
    status: AchievementDefinition.status;
    publishedAt: string | null;
    tiers: Array<AchievementTier>;
    createdAt: string;
    updatedAt: string;
};
export namespace AchievementDefinition {
    export enum category {
        '_0' = 0,
        '_1' = 1,
        '_2' = 2,
        '_3' = 3,
        '_4' = 4,
        '_5' = 5,
    }
    export enum status {
        DRAFT = 'draft',
        PUBLISHED = 'published',
        ARCHIVED = 'archived',
    }
}

