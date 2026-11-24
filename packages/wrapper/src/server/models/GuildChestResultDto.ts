/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GuildRewardDescriptorDto } from './GuildRewardDescriptorDto';
export type GuildChestResultDto = {
    bonusXp: number;
    /**
     * Null when every active chest-pool cosmetic is owned.
     */
    unlockedCosmetic: GuildRewardDescriptorDto | null;
};

