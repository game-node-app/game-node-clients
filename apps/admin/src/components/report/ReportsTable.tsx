"use client";

import React from "react";
import { type Report } from "@/wrapper/server";
import { MantineReactTable, MRT_ColumnDef } from "mantine-react-table";
import {
    reportCategoryToString,
    reportSourceTypeToString,
} from "@/components/report/util/reportCategoryToString";
import { useCustomTable } from "@/components/table/hooks/use-custom-table";
import { useReports } from "@/components/report/hooks/useReports";
import { Button, Paper, Title, Text, Badge } from "@mantine/core";
import { PaginationState } from "@tanstack/table-core";
import { UserAvatarGroup } from "@/components/general/avatar/UserAvatarGroup";
import { useRouter } from "next/navigation";

const columns: MRT_ColumnDef<Report>[] = [
    {
        accessorKey: "id",
        header: "Id",
    },
    {
        accessorKey: "category",
        header: "Category",
        accessorFn: (row) => reportCategoryToString(row.category),
    },
    {
        accessorKey: "sourceType",
        header: "Reported content",
        accessorFn: (row) => reportSourceTypeToString(row.sourceType),
    },
    {
        accessorFn: (row) => (row.isClosed ? "Closed" : "Open"),
        header: "Status",
        filterVariant: "select",
        mantineFilterSelectProps: {
            data: [
                { label: "Open", value: "Open" },
                { label: "Closed", value: "Closed" },
            ],
        },
        Cell: ({ row }) => {
            return (
                <Badge color={row.original.isClosed ? "green" : "red"}>
                    {row.original.isClosed ? "Closed" : "Open"}
                </Badge>
            );
        },
    },
    {
        header: "Report target",
        accessorKey: "targetProfileUserId",
        Cell: (props) => {
            return (
                <UserAvatarGroup
                    userId={props.row.original.targetProfileUserId}
                />
            );
        },
    },
    {
        header: "Reported by",
        accessorKey: "profileUserId",
        Cell: (props) => {
            return (
                <UserAvatarGroup userId={props.row.original.profileUserId} />
            );
        },
    },
    {
        header: "Created At",
        accessorFn: (row) => new Date(row.createdAt).toLocaleString("en-US"),
        sortingFn: (rowA, rowB, columnId) => {
            const createDateA = new Date(rowA.original.createdAt);
            const createDateB = new Date(rowB.original.createdAt);

            return createDateA.getTime() - createDateB.getTime();
        },
        id: "createdAt",
    },
];

const ReportsTable = () => {
    const router = useRouter();

    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const pageAsOffset = pagination.pageSize * pagination.pageIndex;

    const reportsQuery = useReports(pageAsOffset, pagination.pageSize, true);

    const data = reportsQuery.data?.data;

    const table = useCustomTable<Report>({
        columns,
        data: data ?? [],
        rowCount: data?.length ?? 0,
        state: {
            isLoading: reportsQuery.isLoading,
            showAlertBanner: reportsQuery.isError,
            showProgressBars: reportsQuery.isFetching,
            pagination,
        },
        initialState: {
            sorting: [
                {
                    id: "createdAt",
                    desc: true,
                },
            ],
        },
        manualPagination: true,
        pageCount: reportsQuery.data?.pagination.totalPages ?? 1,
        onPaginationChange: setPagination,
        mantineTableBodyRowProps: ({ row }) => ({
            onClick: () => {
                router.push(`/dashboard/report/${row.original.id}`);
            },
            style: {
                cursor: "pointer", //you might want to change the cursor too when adding an onClick
            },
        }),
    });

    return (
        <Paper withBorder radius="md" p="md" mt="lg">
            <MantineReactTable table={table} />
        </Paper>
    );
};

export default ReportsTable;
