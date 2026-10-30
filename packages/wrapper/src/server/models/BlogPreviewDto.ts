/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BlogPreviewCoverDto } from './BlogPreviewCoverDto';
import type { BlogReviewDto } from './BlogReviewDto';
import type { BlogTagDto } from './BlogTagDto';
export type BlogPreviewDto = {
    id: string;
    content: string;
    profileUserId: string;
    tags: Array<BlogTagDto>;
    review: BlogReviewDto | null;
    requestedLocale: BlogPreviewDto.requestedLocale;
    resolvedLocale: BlogPreviewDto.resolvedLocale;
    availableLocales: Array<'en' | 'pt-BR'>;
    title: string | null;
    excerpt: string | null;
    cover: BlogPreviewCoverDto | null;
    publishedAt: string | null;
    status: BlogPreviewDto.status;
};
export namespace BlogPreviewDto {
    export enum requestedLocale {
        EN = 'en',
        PT_BR = 'pt-BR',
    }
    export enum resolvedLocale {
        EN = 'en',
        PT_BR = 'pt-BR',
    }
    export enum status {
        DRAFT = 'draft',
        PUBLISHED = 'published',
    }
}
