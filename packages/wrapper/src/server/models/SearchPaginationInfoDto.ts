/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SearchPaginationInfoDto = {
    /**
     * Total number of items matching the search query and filters.
     */
    totalItems: number;
    /**
     * Total number of pages available for the effective limit.
     */
    totalPages: number;
    /**
     * Whether additional pages exist after the requested page.
     */
    hasNextPage: boolean;
};

