/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type GuildRewardDescriptorDto = {
    id: string;
    key: string;
    kind: GuildRewardDescriptorDto.kind;
    achievementId: string | null;
    inChestPool: boolean;
    chestBonusXp: number;
};
export namespace GuildRewardDescriptorDto {
    export enum kind {
        BADGE = 'badge',
        TITLE = 'title',
        AVATAR_FRAME = 'avatar_frame',
        WEEKLY_CHEST = 'weekly_chest',
    }
}

