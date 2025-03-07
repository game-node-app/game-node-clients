/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ActivityCommentDto } from './ActivityCommentDto';
import type { PaginationInfo } from './PaginationInfo';
import type { PostCommentDto } from './PostCommentDto';
import type { ReviewCommentDto } from './ReviewCommentDto';
export type FindCommentsPaginatedResponseDto = {
    data: Array<(ReviewCommentDto | ActivityCommentDto | PostCommentDto)>;
    pagination: PaginationInfo;
};

