import React from "react";
import { useLatestActivities } from "#@/components/activity/hooks/useLatestActivities";
import { Stack } from "@mantine/core";
import { CenteredLoading } from "#@/components/general/CenteredLoading";
import { CenteredErrorMessage } from "#@/components/general/CenteredErrorMessage";
import { ActivityItem, ActivityItemProps } from "#@/components";
import { Activity } from "@repo/wrapper/server";
import { useTranslation } from "@repo/locales";

interface Props extends Omit<ActivityItemProps, "activity"> {
  userId?: string;
  limit?: number;
  offset?: number;
  type?: Activity.type;
}

const RecentActivityList = ({
  userId,
  offset = 0,
  limit = 5,
  type,
  ...others
}: Props) => {
  const { t } = useTranslation();
  const activitiesQuery = useLatestActivities(userId, offset, limit, type);
  const isEmpty =
    !activitiesQuery.isLoading &&
    activitiesQuery.isSuccess &&
    (activitiesQuery.data == undefined ||
      activitiesQuery.data.data.length === 0);

  return (
    <Stack className={"w-full h-full"}>
      {activitiesQuery.isLoading && <CenteredLoading />}
      {activitiesQuery.data?.data?.map((activity) => {
        return (
          <ActivityItem key={activity.id} activity={activity} {...others} />
        );
      })}
      {activitiesQuery.isError && (
        <CenteredErrorMessage error={activitiesQuery.error} />
      )}
      {isEmpty && (
        <CenteredErrorMessage
          message={t("activity.messages.noRecentActivity")}
        />
      )}
    </Stack>
  );
};

export { RecentActivityList };
