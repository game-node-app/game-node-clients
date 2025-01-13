import React, { useMemo } from "react";
import { AggregatedNotificationContentProps } from "@/components/notifications/AggregatedNotification";
import { useReport } from "@/components/report/hooks/useReport";
import NotificationSkeleton from "@/components/notifications/NotificationSkeleton";
import { Avatar, Group, Text, ThemeIcon } from "@mantine/core";
import { Report } from "@/wrapper/server";
import closeHandleAction = Report.closeHandleAction;
import { IconAlertCircleFilled } from "@tabler/icons-react";

const ReportAggregatedNotification = ({
    aggregatedNotification,
}: AggregatedNotificationContentProps) => {
    const reportQuery = useReport(aggregatedNotification.sourceId as number);

    const alertShortText = useMemo(() => {
        if (reportQuery.data == undefined) {
            return null;
        }

        switch (reportQuery.data.closeHandleAction) {
            case closeHandleAction.ALERT:
                return (
                    "One of your posts goes against GameNode's rules of conduct. " +
                    "This includes discriminatory content, direct or " +
                    "personal attacks against fellow users, or any kind of " +
                    "repeated misbehaviour."
                );
            case closeHandleAction.SUSPEND:
                return (
                    "You have been suspended for 14 days because one of " +
                    "your posts goes against GameNode's rules of conduct. " +
                    "This includes discriminatory content, direct or " +
                    "personal attacks against fellow users, or any kind of " +
                    "repeated misbehaviour. You are thereby prohibited from making or editing posts. " +
                    "You can still access and manage your library."
                );
            case closeHandleAction.BAN:
                return (
                    "You have been permanently banned because one of " +
                    "your posts goes against GameNode's rules of conduct. " +
                    "This includes discriminatory content, direct or " +
                    "personal attacks against fellow users, or any kind of " +
                    "repeated misbehaviour. You are thereby prohibited from making or editing posts. " +
                    "You can still access and manage your library."
                );
        }
    }, [reportQuery.data]);

    if (reportQuery.isLoading) {
        return <NotificationSkeleton />;
    }

    return (
        <Group className={"w-full flex-nowrap"}>
            <ThemeIcon variant={"transparent"} c={"red"} size={"lg"}>
                <IconAlertCircleFilled className={"w-full h-auto"} />
            </ThemeIcon>
            <div>
                <Text>{alertShortText}</Text>
                <Text>The reported content may have been deleted.</Text>
                <Text className={"italic"}>
                    If you think this is a mistake. Please reach out to us
                    through our Discord.
                </Text>
            </div>
        </Group>
    );
};

export default ReportAggregatedNotification;
