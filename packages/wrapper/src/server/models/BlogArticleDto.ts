/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BlogCoverDto } from './BlogCoverDto';
import type { BlogReviewDto } from './BlogReviewDto';
import type { BlogTagDto } from './BlogTagDto';
export type BlogArticleDto = {
    id: string;
    title: string;
    content: string;
    excerpt: string;
    profileUserId: string;
    tags: Array<BlogTagDto>;
    review: BlogReviewDto | null;
    cover: BlogCoverDto;
    publishedAt: string;
    requestedLocale: BlogArticleDto.requestedLocale;
    resolvedLocale: BlogArticleDto.resolvedLocale;
    availableLocales: Array<'en' | 'pt-BR'>;
};
export namespace BlogArticleDto {
    export enum requestedLocale {
        EN = 'en',
        PT_BR = 'pt-BR',
    }
    export enum resolvedLocale {
        EN = 'en',
        PT_BR = 'pt-BR',
    }
}

