/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GuildBoardQuestDto } from './GuildBoardQuestDto';
export type RerollGuildBoardEntryResponseDto = {
    quest: GuildBoardQuestDto;
    rerollsRemaining: number;
    rerollChartersOwned: number;
    /**
     * Consumable spent by this reroll, if free rerolls were exhausted
     */
    consumableUsed: RerollGuildBoardEntryResponseDto.consumableUsed | null;
};
export namespace RerollGuildBoardEntryResponseDto {
    /**
     * Consumable spent by this reroll, if free rerolls were exhausted
     */
    export enum consumableUsed {
        HOURGLASS = 'hourglass',
        REROLL_CHARTER = 'reroll_charter',
        EXTRA_SLOT_PERMIT = 'extra_slot_permit',
    }
}

