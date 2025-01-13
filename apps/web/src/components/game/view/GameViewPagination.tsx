import React from "react";
import { Center, Group, Pagination, PaginationProps } from "@mantine/core";
import { PaginationInfo } from "@/wrapper/server";
import { TPaginationInfoDto } from "@/util/types/pagination";

export interface IGameViewPaginationProps {
    page: number;
    paginationInfo: TPaginationInfoDto | undefined;
    onPaginationChange: (page: number) => void;
}

const GameViewPagination = ({
    page,
    paginationInfo,
    onPaginationChange,
}: IGameViewPaginationProps) => {
    return (
        <Center w={"100%"}>
            <Pagination
                value={page || 1}
                total={paginationInfo?.totalPages || 1}
                onChange={onPaginationChange}
            />
        </Center>
    );
};

export default GameViewPagination;
