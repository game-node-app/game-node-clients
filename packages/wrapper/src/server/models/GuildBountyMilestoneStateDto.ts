/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type GuildBountyMilestoneStateDto = {
    milestone: number;
    unlocked: boolean;
    claimed: boolean;
    claimable: boolean;
    sealsReward: number;
    xpReward: number;
    rewardId: string | null;
    chestKind: GuildBountyMilestoneStateDto.chestKind | null;
};
export namespace GuildBountyMilestoneStateDto {
    export enum chestKind {
        CHEST_BRONZE = 'chest_bronze',
        CHEST_SILVER = 'chest_silver',
        CHEST_GOLD = 'chest_gold',
        CHEST_RELIC = 'chest_relic',
    }
}

