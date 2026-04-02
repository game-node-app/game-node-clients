import React, { useMemo } from "react";
import { AggregatedNotificationContentProps } from "#@/components/notifications/AggregatedNotification";
import { useReport } from "#@/components/report/hooks/useReport";
import { NotificationSkeleton } from "#@/components/notifications/NotificationSkeleton";
import { Avatar, Group, Text, ThemeIcon } from "@mantine/core";
import { Report } from "../../../../../wrapper/src/server";
import closeHandleAction = Report.closeHandleAction;
import { IconAlertCircleFilled } from "@tabler/icons-react";
import { useTranslation } from "@repo/locales";

const ReportAggregatedNotification = ({
  aggregatedNotification,
}: AggregatedNotificationContentProps) => {
  const { t } = useTranslation();
  const reportQuery = useReport(aggregatedNotification.sourceId as number);

  const alertShortText = useMemo(() => {
    if (reportQuery.data == undefined) {
      return null;
    }

    switch (reportQuery.data.closeHandleAction) {
      case closeHandleAction.ALERT:
        return t("reports.messages.alert");
      case closeHandleAction.SUSPEND:
        return t("reports.messages.suspend");
      case closeHandleAction.BAN:
        return t("reports.messages.ban");
    }
  }, [reportQuery.data, t]);

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
        <Text>{t("reports.messages.contentDeleted")}</Text>
        <Text className={"italic"}>{t("reports.messages.appeal")}</Text>
      </div>
    </Group>
  );
};

export { ReportAggregatedNotification };
