/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AwardsCategoryTranslationInputDto } from './AwardsCategoryTranslationInputDto';
export type CreateUpdateAwardsCategoryDto = {
    categoryId?: number;
    year: number;
    name: string;
    description: string;
    order: number;
    nomineeCount?: number;
    translations?: Array<AwardsCategoryTranslationInputDto>;
};

