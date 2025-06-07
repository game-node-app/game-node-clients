/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateUpdateBlogPostReviewInfoDto } from './CreateUpdateBlogPostReviewInfoDto';
export type CreateUpdateBlogPostDto = {
    image?: Record<string, any>;
    postId?: string;
    content: string;
    title: string;
    tags: Array<string>;
    isDraft: boolean;
    reviewInfo?: CreateUpdateBlogPostReviewInfoDto;
};

