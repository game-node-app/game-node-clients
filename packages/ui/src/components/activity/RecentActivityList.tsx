import { ActivityItem, ActivityItemProps } from "#@/components";
import { useLatestActivities } from "#@/components/activity/hooks/useLatestActivities";
import { CenteredErrorMessage } from "#@/components/general/CenteredErrorMessage";
import { CenteredLoading } from "#@/components/general/CenteredLoading";
import { SimpleGrid, SimpleGridProps, Stack } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { Activity } from "@repo/wrapper/server";

interface Props extends Omit<ActivityItemProps, "activity"> {
  userId?: string;
  limit?: number;
  offset?: number;
  type?: Activity.type;
  cols?: SimpleGridProps["cols"];
}

const RecentActivityList = ({
  userId,
  offset = 0,
  limit = 5,
  type,
  cols = 1,
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
      {activitiesQuery.data?.data && (
        <SimpleGrid cols={cols} className={"gn-activity-list w-full"}>
          {activitiesQuery.data.data.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} {...others} />
          ))}
        </SimpleGrid>
      )}
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
