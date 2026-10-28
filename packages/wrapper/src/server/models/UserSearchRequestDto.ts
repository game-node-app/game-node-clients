/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UserSearchRequestDto = {
    /**
     * Nonblank username prefix query (1-256 characters).
     */
    query: string;
    /**
     * Results per page (1-100; defaults to 20 when omitted or 0). Effective offset ((page - 1) * limit) must not exceed 10000.
     */
    limit?: number;
    /**
     * 1-based page number (defaults to 1 when omitted or 0). Effective offset ((page - 1) * limit) must not exceed 10000.
     */
    page?: number;
};

