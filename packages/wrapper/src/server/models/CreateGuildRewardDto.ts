/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateGuildRewardDto = {
    key: string;
    kind: CreateGuildRewardDto.kind;
    /**
     * Required for badge rewards; must be an existing definition.
     */
    achievementId?: string | null;
    inChestPool?: boolean;
    chestBonusXp?: number;
    chestBonusSeals?: number;
    rarity?: CreateGuildRewardDto.rarity;
    /**
     * Required when kind is consumable.
     */
    consumableKey?: CreateGuildRewardDto.consumableKey;
    isActive?: boolean;
};
export namespace CreateGuildRewardDto {
    export enum kind {
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
    export enum rarity {
        COMMON = 'common',
        UNCOMMON = 'uncommon',
        RARE = 'rare',
        EPIC = 'epic',
        LEGENDARY = 'legendary',
    }
    /**
     * Required when kind is consumable.
     */
    export enum consumableKey {
        HOURGLASS = 'hourglass',
        REROLL_CHARTER = 'reroll_charter',
        EXTRA_SLOT_PERMIT = 'extra_slot_permit',
    }
}

