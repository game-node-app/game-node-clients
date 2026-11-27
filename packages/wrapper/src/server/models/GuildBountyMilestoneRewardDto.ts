/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type GuildBountyMilestoneRewardDto = {
    seals?: number;
    xp?: number;
    rewardId?: string;
    chestKind?: GuildBountyMilestoneRewardDto.chestKind;
};
export namespace GuildBountyMilestoneRewardDto {
    export enum chestKind {
        CHEST_BRONZE = 'chest_bronze',
        CHEST_SILVER = 'chest_silver',
        CHEST_GOLD = 'chest_gold',
        CHEST_RELIC = 'chest_relic',
    }
}

