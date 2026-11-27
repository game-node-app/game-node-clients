/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GuildConsumableBalancesDto } from './GuildConsumableBalancesDto';
import type { UserGuildRewardDto } from './UserGuildRewardDto';
export type GuildRewardsResponseDto = {
    unlockedRewards: Array<UserGuildRewardDto>;
    equippedTitleKey: string | null;
    equippedFrameKey: string | null;
    equippedLicenseThemeKey: string | null;
    equippedStampStyleKey: string | null;
    equippedDecorKeys: Array<string>;
    showcaseBadgeIds: Array<string>;
    sealsBalance: number;
    consumables: GuildConsumableBalancesDto;
};

