/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type GuildAdminRewardResponseDto = {
    id: string;
    key: string;
    kind: GuildAdminRewardResponseDto.kind;
    achievementId: string | null;
    inChestPool: boolean;
    chestBonusXp: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};
export namespace GuildAdminRewardResponseDto {
    export enum kind {
        BADGE = 'badge',
        TITLE = 'title',
        AVATAR_FRAME = 'avatar_frame',
        WEEKLY_CHEST = 'weekly_chest',
    }
}

