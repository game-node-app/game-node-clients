/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ActivityComment } from './ActivityComment';
import type { PaginationInfo } from './PaginationInfo';
import type { ReviewComment } from './ReviewComment';
export type FindCommentsPaginatedResponseDto = {
    data: Array<(ReviewComment | ActivityComment)>;
    pagination: PaginationInfo;
};

