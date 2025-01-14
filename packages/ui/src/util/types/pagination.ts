import { PaginationInfo } from "@repo/wrapper/server";
import { schema_PaginationInfo } from "@repo/wrapper/search";

export type TPaginationInfoDto = PaginationInfo | schema_PaginationInfo;

export type TBasePaginationRequest = {
  offset?: number;
  limit?: number;
};
