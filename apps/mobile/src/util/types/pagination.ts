import { PaginationInfo } from "@/wrapper/server";
import { schema_PaginationInfo } from "@/wrapper/search";

export type TPaginationInfoDto = PaginationInfo | schema_PaginationInfo;

export type TBasePaginationRequest = {
    offset?: number;
    limit?: number;
};
