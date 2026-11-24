/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GuildEventTranslationDto } from './GuildEventTranslationDto';
import type { GuildRewardDescriptorDto } from './GuildRewardDescriptorDto';
export type GuildAdminEventResponseDto = {
    id: string;
    slug: string;
    title: string;
    description: string;
    rank: GuildAdminEventResponseDto.rank;
    xpReward: number;
    objectiveType: GuildAdminEventResponseDto.objectiveType;
    targetCount: number;
    criteria: Record<string, any>;
    reward: GuildRewardDescriptorDto | null;
    startsAt: string;
    endsAt: string;
    status: GuildAdminEventResponseDto.status;
    publishedAt: string | null;
    translations: Array<GuildEventTranslationDto>;
    createdAt: string;
    updatedAt: string;
};
export namespace GuildAdminEventResponseDto {
    export enum rank {
        E = 'E',
        D = 'D',
        C = 'C',
        B = 'B',
        A = 'A',
        S = 'S',
    }
    export enum objectiveType {
        FINISH_GAME = 'finish_game',
        WRITE_REVIEW = 'write_review',
    }
    export enum status {
        DRAFT = 'draft',
        PUBLISHED = 'published',
        ARCHIVED = 'archived',
    }
}

