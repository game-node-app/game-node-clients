/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GuildRewardDescriptorDto } from './GuildRewardDescriptorDto';
export type GuildChestResultDto = {
    chestKind: GuildChestResultDto.chestKind;
    bonusXp: number;
    bonusSeals: number;
    /**
     * Null when every active chest-pool cosmetic is owned.
     */
    unlockedCosmetic: GuildRewardDescriptorDto | null;
    /**
     * Deterministic Gold/Relic chest consumable drop, if any.
     */
    grantedConsumable: GuildChestResultDto.grantedConsumable | null;
};
export namespace GuildChestResultDto {
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
    /**
     * Deterministic Gold/Relic chest consumable drop, if any.
     */
    export enum grantedConsumable {
        HOURGLASS = 'hourglass',
        REROLL_CHARTER = 'reroll_charter',
        EXTRA_SLOT_PERMIT = 'extra_slot_permit',
    }
}

