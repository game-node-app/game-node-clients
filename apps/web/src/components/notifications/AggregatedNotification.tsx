import React, { useMemo } from "react";
import { NotificationAggregateDto } from "@/wrapper/server";
import ReviewAggregatedNotification from "@/components/notifications/item/ReviewAggregatedNotification";
import FollowerAggregatedNotification from "@/components/notifications/item/FollowerAggregatedNotification";
import { Notification } from "@mantine/core";
import sourceType = NotificationAggregateDto.sourceType;
import category = NotificationAggregateDto.category;
import ImporterWatchAggregatedNotification from "@/components/notifications/item/ImporterWatchAggregatedNotification";
import ReportAggregatedNotification from "@/components/notifications/item/ReportAggregatedNotification";
import ActivityAggregatedNotification from "@/components/notifications/item/ActivityAggregatedNotification";
import ActivityCommentAggregatedNotification from "@/components/notifications/item/ActivityCommentAggregatedNotification";
import ReviewCommentAggregatedNotification from "@/components/notifications/item/ReviewCommentAggregatedNotification";

export interface AggregatedNotificationProps {
    aggregatedNotification: NotificationAggregateDto;
    onClick: () => void;
    backgroundColor: "normal" | "darker";
}

export interface AggregatedNotificationContentProps {
    aggregatedNotification: NotificationAggregateDto;
}

const AggregatedNotification = ({
    aggregatedNotification,
    onClick,
    backgroundColor,
}: AggregatedNotificationProps) => {
    const notificationContent = useMemo(() => {
        switch (aggregatedNotification.sourceType) {
            case sourceType.ACTIVITY:
                return (
                    <ActivityAggregatedNotification
                        aggregatedNotification={aggregatedNotification}
                    />
                );
            case sourceType.ACTIVITY_COMMENT:
                return (
                    <ActivityCommentAggregatedNotification
                        aggregatedNotification={aggregatedNotification}
                    />
                );
            case sourceType.REVIEW:
                return (
                    <ReviewAggregatedNotification
                        aggregatedNotification={aggregatedNotification}
                    />
                );
            case sourceType.REVIEW_COMMENT:
                return (
                    <ReviewCommentAggregatedNotification
                        aggregatedNotification={aggregatedNotification}
                    />
                );
            case sourceType.PROFILE:
                if (aggregatedNotification.category === category.FOLLOW)
                    return (
                        <FollowerAggregatedNotification
                            aggregatedNotification={aggregatedNotification}
                        />
                    );
                return null;
            case sourceType.IMPORTER:
                if (aggregatedNotification.category === category.WATCH) {
                    return (
                        <ImporterWatchAggregatedNotification
                            aggregatedNotification={aggregatedNotification}
                        />
                    );
                }
                return null;
            case NotificationAggregateDto.sourceType.REPORT:
                return (
                    <ReportAggregatedNotification
                        aggregatedNotification={aggregatedNotification}
                    />
                );
        }

        return null;
    }, [aggregatedNotification]);

    return (
        <Notification
            color="rgba(255, 255, 255, 0)"
            className={`w-full ${backgroundColor === "normal" ? "bg-[#262626]" : "bg-[#171717]"}`}
            withCloseButton={false}
            onClick={onClick}
            radius={0}
            styles={{
                root: {
                    paddingLeft: 10,
                    paddingRight: 10,
                },
            }}
        >
            {notificationContent}
        </Notification>
    );
};

export default AggregatedNotification;
