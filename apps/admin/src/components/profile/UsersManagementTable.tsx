"use client";

import React, { useState } from "react";
import { useUserProfiles } from "@/components/profile/hooks/useUserProfiles";
import { MantineReactTable, MRT_ColumnDef } from "mantine-react-table";
import {
    CreateReportRequestDto,
    FindAllProfileResponseItemDto,
} from "@/wrapper/server";
import CenteredLoading from "@/components/general/CenteredLoading";
import CenteredErrorMessage from "@/components/general/CenteredErrorMessage";
import { Badge, MantineColor, Menu, Modal, Paper } from "@mantine/core";
import { useCustomTable } from "@/components/table/hooks/use-custom-table";
import { UserAvatarGroup } from "@/components/general/avatar/UserAvatarGroup";
import { useDisclosure } from "@mantine/hooks";
import ReportCreateForm from "@/components/report/form/ReportCreateForm";
import sourceType = CreateReportRequestDto.sourceType;

const columns: MRT_ColumnDef<FindAllProfileResponseItemDto>[] = [
    {
        accessorKey: "profile.username",
        header: "Username",
        Cell: ({ row }) => {
            return <UserAvatarGroup userId={row.original.profile.userId} />;
        },
    },
    {
        accessorFn: (row) => {
            if (row.isSuspended) {
                return "SUSPENDED";
            } else if (row.isBanned) {
                return "BANNED";
            }
            return "NORMAL";
        },
        header: "Status",
        filterVariant: "select",
        mantineFilterSelectProps: {
            data: [
                { label: "Normal", value: "NORMAL" },
                { label: "Suspended", value: "SUSPENDED" },
                { label: "Banned", value: "BANNED" },
            ],
        },
        Cell: ({ row, renderedCellValue }) => {
            const item = row.original;
            const color: MantineColor =
                item.isSuspended || item.isBanned ? "red" : "green";
            return <Badge color={color}>{renderedCellValue}</Badge>;
        },
    },
    {
        header: "Joined at",
        accessorFn: (row) =>
            new Date(row.profile.createdAt).toLocaleString("en-US"),
        sortingFn: (rowA, rowB, columnId) => {
            const createDateA = new Date(rowA.original.profile.createdAt);
            const createDateB = new Date(rowB.original.profile.createdAt);

            return createDateA.getTime() - createDateB.getTime();
        },
        id: "createdAt",
    },
];

const UsersManagementTable = () => {
    const { data, isLoading, isError, isFetching } = useUserProfiles();

    const [reportModalOpened, reportModalUtils] = useDisclosure();

    const [reportedUserId, setReportedUserId] = useState<string | undefined>(
        undefined,
    );

    const table = useCustomTable<FindAllProfileResponseItemDto>({
        columns,
        data: data ?? [],
        rowCount: data?.length ?? 0,
        state: {
            isLoading: isLoading,
            showAlertBanner: isError,
            showProgressBars: isFetching,
        },
        initialState: {
            sorting: [
                {
                    id: "createdAt",
                    desc: true,
                },
            ],
        },
        enableRowActions: true,
        renderRowActionMenuItems: (item) => {
            const profile = item.row.original.profile;
            return (
                <>
                    <Menu.Item
                        onClick={() => {
                            setReportedUserId(profile.userId);
                            reportModalUtils.open();
                        }}
                    >
                        Generate report
                    </Menu.Item>
                </>
            );
        },
    });

    return (
        <Paper withBorder radius="md" p="md" mt="lg">
            <Modal
                title={"Generate report"}
                opened={reportModalOpened}
                onClose={reportModalUtils.close}
            >
                {reportedUserId && (
                    <ReportCreateForm
                        sourceId={reportedUserId}
                        sourceType={sourceType.PROFILE}
                        onSuccess={reportModalUtils.close}
                    />
                )}
            </Modal>
            <MantineReactTable table={table} />
        </Paper>
    );
};

export default UsersManagementTable;
