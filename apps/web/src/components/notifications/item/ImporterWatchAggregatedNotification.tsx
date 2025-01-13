import React, { useMemo } from "react";
import { AggregatedNotificationContentProps } from "@/components/notifications/AggregatedNotification";
import { useImporterNotification } from "@/components/importer/hooks/useImporterNotification";
import NotificationSkeleton from "@/components/notifications/NotificationSkeleton";
import Link from "next/link";
import { Group, Image, Text } from "@mantine/core";
import { getServerStoredIcon } from "@/util/getServerStoredImages";

const ImporterWatchAggregatedNotification = ({
    aggregatedNotification,
}: AggregatedNotificationContentProps) => {
    const notificationQuery = useImporterNotification(
        aggregatedNotification.sourceId as number,
    );

    const sourceName = useMemo(() => {
        if (notificationQuery.data && notificationQuery.data.source) {
            // Capitalizes the source name
            return (
                notificationQuery.data.source.charAt(0).toUpperCase() +
                notificationQuery.data.source.slice(1)
            );
        }
    }, [notificationQuery.data]);

    if (notificationQuery.isLoading) {
        return <NotificationSkeleton />;
    } else if (notificationQuery.data == undefined) {
        return null;
    }

    return (
        <Link href={`/importer/${notificationQuery.data?.source}`}>
            <Group className={"w-full flex-nowrap justify-center items-center"}>
                <Image
                    alt={"Importer source icon"}
                    src={getServerStoredIcon(
                        notificationQuery.data.source.valueOf(),
                    )}
                    w={38}
                    h={38}
                />
                <Text>
                    We've found {notificationQuery.data?.games?.length} new
                    games ready to be imported from your {sourceName}{" "}
                    connection.
                </Text>
            </Group>
        </Link>
    );
};

export default ImporterWatchAggregatedNotification;
