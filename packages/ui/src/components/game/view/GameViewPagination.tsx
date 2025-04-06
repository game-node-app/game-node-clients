import React from "react";
import {
  Center,
  CenterProps,
  Pagination,
  PaginationProps,
} from "@mantine/core";
import { TPaginationInfoDto } from "#@/util/types/pagination";

export interface IGameViewPaginationProps
  extends Omit<PaginationProps, "value" | "total" | "onChange" | "results"> {
  page: number;
  paginationInfo: TPaginationInfoDto | undefined;
  onPaginationChange: (page: number) => void;
  wrapperProps?: CenterProps;
}

const GameViewPagination = ({
  page,
  paginationInfo,
  onPaginationChange,
  wrapperProps,
  ...others
}: IGameViewPaginationProps) => {
  return (
    <Center w={"100%"} {...wrapperProps}>
      <Pagination
        {...others}
        value={page || 1}
        total={paginationInfo?.totalPages || 1}
        onChange={onPaginationChange}
      />
    </Center>
  );
};

export { GameViewPagination };
