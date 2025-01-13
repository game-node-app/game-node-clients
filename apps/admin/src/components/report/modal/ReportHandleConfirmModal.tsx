import React, { useEffect, useMemo, useState } from "react";
import {
    Button,
    Checkbox,
    ComboboxItem,
    Group,
    Modal,
    Select,
    Stack,
    Text,
} from "@mantine/core";
import { BaseModalProps } from "@/util/types/modal-props";
import { HandleReportRequestDto, ReportService } from "@/wrapper/server";
import { useMutation } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { useReports } from "@/components/report/hooks/useReports";
import { useRouter } from "next/router";
import HandleAction = HandleReportRequestDto.action;

interface Props extends BaseModalProps {
    reportId: number;
}

const SELECT_ACTIONS: ComboboxItem[] = [
    { label: "Alert", value: HandleAction.ALERT },
    { label: "Suspend", value: HandleAction.SUSPEND },
    { label: "Ban", value: HandleAction.BAN },
    { label: "Discard", value: HandleAction.DISCARD },
];

const ReportHandleConfirmModal = ({ reportId, opened, onClose }: Props) => {
    // Only used for invalidation!
    const reportsQuery = useReports();
    const [deleteReportedContent, setDeleteReportedContent] = useState(true);
    const [handleAction, setHandleAction] = useState<
        HandleReportRequestDto.action | undefined
    >(undefined);

    /**
     * Effect to sync handle action with delete action
     */
    useEffect(() => {
        if (handleAction === HandleAction.DISCARD) {
            setDeleteReportedContent(false);
        } else {
            setDeleteReportedContent(true);
        }
    }, [handleAction]);

    const actionDescription = useMemo(() => {
        switch (handleAction) {
            case HandleReportRequestDto.action.ALERT:
                return (
                    "This will send an alert to the user, " +
                    "notifying that they have posted content that goes against our rules."
                );
            case HandleReportRequestDto.action.SUSPEND:
                return (
                    "This will suspend the user for 14 days. " +
                    "Suspensions make the user unable to create or edit reviews, comments, or perform " +
                    "direct social interaction with other users. They will still be able to access " +
                    "GameNode and manage their library."
                );
            case HandleReportRequestDto.action.BAN:
                return (
                    "This will permanently ban the user. " +
                    "Bans make the user unable to create or edit reviews, comments, or perform " +
                    "direct social interaction with other users. They will still be able to access " +
                    "GameNode and manage their library. Only admins can issue bans."
                );
            case HandleReportRequestDto.action.DISCARD:
                return "This will simply discard this report, keeping the reported content intact. No alert will be sent to the reported user.";
            default:
                return "Select an action to continue.";
        }
    }, [handleAction]);

    const reportHandleMutation = useMutation({
        mutationFn: async () => {
            if (!handleAction) {
                throw new Error("No action selected!");
            }
            await ReportService.reportControllerHandleV1(reportId, {
                action: handleAction,
                deleteReportedContent:
                    handleAction !== "discard" ? deleteReportedContent : false,
            });
        },
        onSuccess: () => {
            notifications.show({
                color: "green",
                message: "Successfully closed report!",
            });
            onClose();
        },
        onError: () => {
            notifications.show({
                color: "error",
                message:
                    "Error while closing report! Please try again. If this persists, contact support.",
            });
        },
        onSettled: () => {
            reportsQuery.invalidate();
        },
    });

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={"Confirm report closing"}
        >
            <Modal.Body>
                <Stack className={"w-full h-full items-center"}>
                    <Select
                        className={"w-full"}
                        value={handleAction}
                        onChange={(v) => {
                            if (v) {
                                setHandleAction(
                                    v as HandleReportRequestDto.action,
                                );
                                return;
                            }
                        }}
                        data={SELECT_ACTIONS}
                        label={"Action"}
                        description={"Select an action to perform"}
                    />
                    <Text className={"text-center"}>{actionDescription}</Text>
                    <Checkbox
                        checked={deleteReportedContent}
                        onChange={(v) => {
                            setDeleteReportedContent(v.currentTarget.checked);
                        }}
                        className={"my-3"}
                        label={"Remove reported content"}
                        description={"This action cannot be undone"}
                        disabled={handleAction === "discard"}
                    />
                    <Group>
                        <Button
                            color={"blue"}
                            onClick={onClose}
                            disabled={reportHandleMutation.isPending}
                        >
                            Go back
                        </Button>
                        <Button
                            loading={reportHandleMutation.isPending}
                            color={"red"}
                            onClick={() => {
                                reportHandleMutation.mutate();
                            }}
                            disabled={handleAction == undefined}
                        >
                            Confirm
                        </Button>
                    </Group>
                </Stack>
            </Modal.Body>
        </Modal>
    );
};

export default ReportHandleConfirmModal;
