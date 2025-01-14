import React from "react";
import { Center, Group, Pagination, PaginationProps } from "@mantine/core";
import { PaginationInfo } from "@/wrapper/server";
import { TPaginationInfoDto } from "@/util/types/pagination";

export interface IGameViewPaginationProps {
    page: number;
    paginationInfo: TPaginationInfoDto | undefined;
    onPaginationChange: (page: number) => void;
}

/**
 * Classic pagination component imported from 'game-node-web'. <br>
 * Generally, you should avoid using this. Mobile users have different expectations on
 * pagination as a whole, and this may worsen the user experience. <br>
 * 'GameViewContent' already features pagination handling.
 * @param page
 * @param paginationInfo
 * @param onPaginationChange
 * @constructor
 */
const GameViewPagination = ({ page, paginationInfo, onPaginationChange }: IGameViewPaginationProps) => {
    return (
        <Center w={"100%"}>
            <Pagination value={page || 1} total={paginationInfo?.totalPages || 1} onChange={onPaginationChange} />
        </Center>
    );
};

export default GameViewPagination;
