import { PaginationInfo } from "../../../../wrapper/src/server";
import { schema_PaginationInfo } from "../../../../wrapper/src/search";

export type TPaginationInfoDto = PaginationInfo | schema_PaginationInfo;

export type TBasePaginationRequest = {
  offset?: number;
  limit?: number;
};
