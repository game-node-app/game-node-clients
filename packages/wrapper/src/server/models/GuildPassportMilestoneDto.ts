/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type GuildPassportMilestoneDto = {
    milestone: number;
    status: GuildPassportMilestoneDto.status;
    chestKind: GuildPassportMilestoneDto.chestKind;
    sealsReward: number;
    consumableKey: GuildPassportMilestoneDto.consumableKey | null;
    consumableQuantity: number;
};
export namespace GuildPassportMilestoneDto {
    export enum status {
        LOCKED = 'locked',
        CLAIMABLE = 'claimable',
        CLAIMED = 'claimed',
    }
    export enum chestKind {
        BADGE = 'badge',
        TITLE = 'title',
        AVATAR_FRAME = 'avatar_frame',
        LICENSE_THEME = 'license_theme',
        STAMP_STYLE = 'stamp_style',
        TAVERN_DECOR = 'tavern_decor',
        CONSUMABLE = 'consumable',
        WEEKLY_CHEST = 'weekly_chest',
        CHEST_BRONZE = 'chest_bronze',
        CHEST_SILVER = 'chest_silver',
        CHEST_GOLD = 'chest_gold',
        CHEST_RELIC = 'chest_relic',
    }
    export enum consumableKey {
        HOURGLASS = 'hourglass',
        REROLL_CHARTER = 'reroll_charter',
        EXTRA_SLOT_PERMIT = 'extra_slot_permit',
    }
}

