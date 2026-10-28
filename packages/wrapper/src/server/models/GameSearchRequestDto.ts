/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type GameSearchRequestDto = {
    /**
     * Search query matched against game names and alternative names. When omitted or empty, browses games using the supplied filters.
     */
    query?: string;
    /**
     * Game category enum values (OR within field).
     */
    category?: Array<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14>;
    /**
     * Game status enum values (OR within field).
     */
    status?: Array<0 | 2 | 3 | 4 | 5 | 6 | 7 | 8>;
    /**
     * Genre resource names or decimal IDs (each max 256 chars, max 100 items, OR within field).
     */
    genres?: Array<string>;
    /**
     * Theme resource names or decimal IDs (each max 256 chars, max 100 items, OR within field).
     */
    themes?: Array<string>;
    /**
     * Platform resource names, abbreviations, or decimal IDs (each max 256 chars, max 100 items, OR within field).
     */
    platforms?: Array<string>;
    /**
     * Results per page (1-100; defaults to 20 when omitted or 0). Effective offset ((page - 1) * limit) must not exceed 10000.
     */
    limit?: number;
    /**
     * 1-based page number (defaults to 1 when omitted or 0). Effective offset ((page - 1) * limit) must not exceed 10000.
     */
    page?: number;
    /**
     * Legacy boolean flag accepted for client compatibility; engine execution profiles are never exposed to public responses.
     */
    profile?: boolean;
};

