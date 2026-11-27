/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GuildChestResultDto } from './GuildChestResultDto';
import type { GuildConsumableBalancesDto } from './GuildConsumableBalancesDto';
import type { GuildRewardDescriptorDto } from './GuildRewardDescriptorDto';
export type GuildEmporiumPurchaseResponseDto = {
    itemId: string;
    priceSeals: number;
    sealsBalance: number;
    reward: GuildRewardDescriptorDto;
    chestResult: GuildChestResultDto | null;
    consumables: GuildConsumableBalancesDto;
};

