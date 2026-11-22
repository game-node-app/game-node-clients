/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UpdateGuildRewardDto = {
    key?: string;
    kind?: UpdateGuildRewardDto.kind;
    /**
     * Required for badge rewards; must be an existing definition.
     */
    achievementId?: string | null;
    inChestPool?: boolean;
    chestBonusXp?: number;
    isActive?: boolean;
};
export namespace UpdateGuildRewardDto {
    export enum kind {
        BADGE = 'badge',
        TITLE = 'title',
        AVATAR_FRAME = 'avatar_frame',
        WEEKLY_CHEST = 'weekly_chest',
    }
}

